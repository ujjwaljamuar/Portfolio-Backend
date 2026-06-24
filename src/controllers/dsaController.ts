import { Request, Response } from "express";
import mongoose from "mongoose";

import DsaProblemModel from "../models/dsaModel.js";
import { DsaDifficulty, DsaStatus } from "../types/dsa.types.js";
import { buildJsonResponse } from "../utils/response.js";

const allowedStatuses: DsaStatus[] = ["Todo", "Solved"];
const allowedDifficulties: DsaDifficulty[] = ["Easy", "Medium", "Hard"];
const revisionStatuses = ["Revision", "revision"];
const dsaProblemSummaryProjection = "-question -approaches -notes";

type ControllerError = Error & {
  name?: string;
  code?: number;
};

const isValidObjectId = (id: string): boolean => mongoose.isValidObjectId(id);

const handleDsaError = (
  res: Response,
  error: ControllerError,
  fallbackMessage: string,
) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json(
      buildJsonResponse({
        success: false,
        message: error.message,
      }),
    );
  }

  return res.status(500).json(
    buildJsonResponse({
      success: false,
      message: error.message || fallbackMessage,
    }),
  );
};

const sendInvalidIdResponse = (res: Response) => {
  return res.status(400).json(
    buildJsonResponse({
      success: false,
      message: "Invalid DSA problem id",
    }),
  );
};

const sendNotFoundResponse = (res: Response) => {
  return res.status(404).json(
    buildJsonResponse({
      success: false,
      message: "DSA problem not found",
    }),
  );
};

const normalizeStatus = (status: unknown): DsaStatus | undefined => {
  if (status === "todo" || status === "Todo") {
    return "Todo";
  }

  if (status === "solved" || status === "Solved") {
    return "Solved";
  }

  return undefined;
};

const isRevisionStatus = (status: unknown): boolean => {
  return typeof status === "string" && revisionStatuses.includes(status);
};

const getSolvedFilter = () => ({
  $or: [{ status: "Solved" }, { status: "Revision" }],
});

const getRevisionFilter = () => ({
  $or: [{ needsRevision: true }, { status: "Revision" }],
});

export const createDsaProblem = async (req: Request, res: Response) => {
  try {
    const createData = { ...req.body };

    if (isRevisionStatus(createData.status)) {
      createData.status = "Solved";
      createData.needsRevision = true;
      createData.lastRevisedAt = new Date();
    } else {
      const normalizedStatus = normalizeStatus(createData.status);

      if (normalizedStatus) {
        createData.status = normalizedStatus;
      }
    }

    const problem = await DsaProblemModel.create(createData);

    return res.status(201).json(
      buildJsonResponse({
        message: "DSA problem created successfully",
        data: problem,
      }),
    );
  } catch (error: any) {
    return handleDsaError(res, error, "Failed to create DSA problem");
  }
};

export const getDsaProblems = async (req: Request, res: Response) => {
  const { difficulty, status, tag } = req.query;
  const filters: Record<string, unknown> = {};

  if (typeof difficulty === "string") {
    if (!allowedDifficulties.includes(difficulty as DsaDifficulty)) {
      return res.status(400).json(
        buildJsonResponse({
          success: false,
          message: "Invalid difficulty filter",
        }),
      );
    }

    filters.difficulty = difficulty;
  }

  if (typeof status === "string") {
    if (isRevisionStatus(status)) {
      filters.$or = [{ needsRevision: true }, { status: "Revision" }];
    } else {
      const normalizedStatus = normalizeStatus(status);

      if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json(
          buildJsonResponse({
            success: false,
            message: "Invalid status filter",
          }),
        );
      }

      filters.status = normalizedStatus;
    }
  }

  if (typeof req.query.needsRevision === "string") {
    if (!["true", "false"].includes(req.query.needsRevision)) {
      return res.status(400).json(
        buildJsonResponse({
          success: false,
          message: "Invalid needsRevision filter",
        }),
      );
    }

    if (req.query.needsRevision === "true") {
      filters.$or = [{ needsRevision: true }, { status: "Revision" }];
    } else {
      filters.needsRevision = false;
    }
  }

  if (typeof tag === "string" && tag.trim()) {
    filters.tags = tag.trim();
  }

  const problems = await DsaProblemModel.find(filters)
    .select(dsaProblemSummaryProjection)
    .sort({ createdAt: -1 });

  return res.json(
    buildJsonResponse({
      message: "DSA problems fetched successfully",
      data: problems,
    }),
  );
};

export const searchDsaProblems = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (typeof q !== "string" || !q.trim()) {
    return res.status(400).json(
      buildJsonResponse({
        success: false,
        message: "Search query is required",
      }),
    );
  }

  const problems = await DsaProblemModel.find(
    { $text: { $search: q.trim() } },
    { score: { $meta: "textScore" } },
  )
    .select(dsaProblemSummaryProjection)
    .sort({ score: { $meta: "textScore" } });

  return res.json(
    buildJsonResponse({
      message: "DSA problems search completed successfully",
      data: problems,
    }),
  );
};

export const getDsaStats = async (_req: Request, res: Response) => {
  const [
    total,
    todo,
    solved,
    revision,
    easyTotal,
    easySolved,
    mediumTotal,
    mediumSolved,
    hardTotal,
    hardSolved,
  ] = await Promise.all([
    DsaProblemModel.countDocuments(),
    DsaProblemModel.countDocuments({ status: "Todo" }),
    DsaProblemModel.countDocuments(getSolvedFilter()),
    DsaProblemModel.countDocuments(getRevisionFilter()),
    DsaProblemModel.countDocuments({ difficulty: "Easy" }),
    DsaProblemModel.countDocuments({
      difficulty: "Easy",
      ...getSolvedFilter(),
    }),
    DsaProblemModel.countDocuments({ difficulty: "Medium" }),
    DsaProblemModel.countDocuments({
      difficulty: "Medium",
      ...getSolvedFilter(),
    }),
    DsaProblemModel.countDocuments({ difficulty: "Hard" }),
    DsaProblemModel.countDocuments({
      difficulty: "Hard",
      ...getSolvedFilter(),
    }),
  ]);

  return res.json(
    buildJsonResponse({
      message: "DSA statistics fetched successfully",
      data: {
        total,
        todo,
        solved,
        solvedOutOfTotal: {
          solved,
          total,
        },
        revision,
        byDifficulty: {
          easy: {
            total: easyTotal,
            solved: easySolved,
          },
          medium: {
            total: mediumTotal,
            solved: mediumSolved,
          },
          hard: {
            total: hardTotal,
            solved: hardSolved,
          },
        },
      },
    }),
  );
};

export const getDsaProblemById = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return sendInvalidIdResponse(res);
  }

  const problem = await DsaProblemModel.findById(req.params.id);

  if (!problem) {
    return sendNotFoundResponse(res);
  }

  return res.json(
    buildJsonResponse({
      message: "DSA problem fetched successfully",
      data: problem,
    }),
  );
};

export const updateDsaProblem = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return sendInvalidIdResponse(res);
  }

  try {
    const updateData = { ...req.body };

    if (isRevisionStatus(updateData.status)) {
      updateData.status = "Solved";
      updateData.needsRevision = true;
      updateData.lastRevisedAt = new Date();
    } else {
      const normalizedStatus = normalizeStatus(updateData.status);

      if (normalizedStatus) {
        updateData.status = normalizedStatus;
      }
    }

    if (updateData.needsRevision === true) {
      updateData.lastRevisedAt = new Date();
    }

    const problem = await DsaProblemModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!problem) {
      return sendNotFoundResponse(res);
    }

    return res.json(
      buildJsonResponse({
        message: "DSA problem updated successfully",
        data: problem,
      }),
    );
  } catch (error: any) {
    return handleDsaError(res, error, "Failed to update DSA problem");
  }
};

export const deleteDsaProblem = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return sendInvalidIdResponse(res);
  }

  const problem = await DsaProblemModel.findByIdAndDelete(req.params.id);

  if (!problem) {
    return sendNotFoundResponse(res);
  }

  return res.json(
    buildJsonResponse({
      message: "DSA problem deleted successfully",
    }),
  );
};

export const updateDsaStatus = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return sendInvalidIdResponse(res);
  }

  const { status } = req.body ?? {};

  if (isRevisionStatus(status)) {
    const problem = await DsaProblemModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "Solved",
        needsRevision: true,
        lastRevisedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!problem) {
      return sendNotFoundResponse(res);
    }

    return res.json(
      buildJsonResponse({
        message: "DSA problem marked for revision successfully",
        data: problem,
      }),
    );
  }

  const normalizedStatus = normalizeStatus(status);

  if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json(
      buildJsonResponse({
        success: false,
        message: "Invalid status",
      }),
    );
  }

  const problem = await DsaProblemModel.findByIdAndUpdate(
    req.params.id,
    {
      status: normalizedStatus,
      ...(normalizedStatus === "Todo" ? { needsRevision: false } : {}),
    },
    { new: true, runValidators: true },
  );

  if (!problem) {
    return sendNotFoundResponse(res);
  }

  return res.json(
    buildJsonResponse({
      message: "DSA problem status updated successfully",
      data: problem,
    }),
  );
};

export const reviseDsaProblem = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return sendInvalidIdResponse(res);
  }

  const problem = await DsaProblemModel.findByIdAndUpdate(
    req.params.id,
    {
      status: "Solved",
      needsRevision: true,
      $inc: { revisionCount: 1 },
      lastRevisedAt: new Date(),
    },
    { new: true },
  );

  if (!problem) {
    return sendNotFoundResponse(res);
  }

  return res.json(
    buildJsonResponse({
      message: "DSA problem revision updated successfully",
      data: problem,
    }),
  );
};
