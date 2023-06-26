import { UnauthError } from "../errors/index.js";

const checkPermissions = (requestUser, resourceUserId) => {
  // check role and id, if matches to one of them just procced , alse throw 401
  if (requestUser.role === "admin") return;
  //   convert mongoose objectId to string
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnauthError("Not Authorized to access this route");
};

export default checkPermissions;
