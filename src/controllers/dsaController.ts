import { Request, Response } from "express";
import mongoose from "mongoose";

import DsaProblemModel from "../models/dsaModel.js";
import { DsaDifficulty, DsaStatus } from "../types/dsa.types.js";
import { buildJsonResponse } from "../utils/response.js";

const allowedStatuses: DsaStatus[] = ["Todo", "Solved", "Revision"];
const allowedDifficulties: DsaDifficulty[] = ["Easy", "Medium", "Hard"];

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

export const createDsaProblem = async (req: Request, res: Response) => {
  try {
    const problem = await DsaProblemModel.create(req.body);

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
    if (!allowedStatuses.includes(status as DsaStatus)) {
      return res.status(400).json(
        buildJsonResponse({
          success: false,
          message: "Invalid status filter",
        }),
      );
    }

    filters.status = status;
  }

  if (typeof tag === "string" && tag.trim()) {
    filters.tags = tag.trim();
  }

  const problems = await DsaProblemModel.find(filters).sort({ createdAt: -1 });

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
  ).sort({ score: { $meta: "textScore" } });

  return res.json(
    buildJsonResponse({
      message: "DSA problems search completed successfully",
      data: problems,
    }),
  );
};

export const getDsaStats = async (_req: Request, res: Response) => {
  const [total, todo, solved, revision, easy, medium, hard] = await Promise.all(
    [
      DsaProblemModel.countDocuments(),
      DsaProblemModel.countDocuments({ status: "todo" }),
      DsaProblemModel.countDocuments({ status: "solved" }),
      DsaProblemModel.countDocuments({ status: "revision" }),
      DsaProblemModel.countDocuments({ difficulty: "Easy" }),
      DsaProblemModel.countDocuments({ difficulty: "Medium" }),
      DsaProblemModel.countDocuments({ difficulty: "Hard" }),
    ],
  );

  return res.json(
    buildJsonResponse({
      message: "DSA statistics fetched successfully",
      data: {
        total,
        todo,
        solved,
        revision,
        easy,
        medium,
        hard,
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

    if (updateData.status === "revision") {
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

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json(
      buildJsonResponse({
        success: false,
        message: "Invalid status",
      }),
    );
  }

  const updateData: { status: DsaStatus; lastRevisedAt?: Date } = { status };

  if (status === "revision") {
    updateData.lastRevisedAt = new Date();
  }

  const problem = await DsaProblemModel.findByIdAndUpdate(
    req.params.id,
    updateData,
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
