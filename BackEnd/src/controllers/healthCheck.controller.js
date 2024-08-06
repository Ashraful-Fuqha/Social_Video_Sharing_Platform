import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIErrors.js";
import { APIResponse } from "../utils/APIResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new APIResponse(200, {}, "Server is working properly"));
});

export { healthCheck };