const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

describe("AppError", () => {
  it("creates an error with the given message and status code", () => {
    const error = new AppError("Test error", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  it("defaults to status 500", () => {
    const error = new AppError("Server error");
    expect(error.statusCode).toBe(500);
  });
});

describe("asyncHandler", () => {
  it("wraps a function and catches errors", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    const fn = async () => {
      throw new Error("async error");
    };

    const wrapped = asyncHandler(fn);
    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("passes through successful execution", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const result = [];

    const fn = async () => {
      result.push("done");
    };

    const wrapped = asyncHandler(fn);
    await wrapped(mockReq, mockRes, mockNext);

    expect(result).toEqual(["done"]);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
