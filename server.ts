import app from "./app.js";
import config from "./src/configs/config.js";

const port = config.port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
