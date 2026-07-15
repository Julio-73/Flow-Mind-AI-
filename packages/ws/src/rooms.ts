export const ROOMS = {
  ORG_PREFIX: "org:",
  WORKSPACE_PREFIX: "workspace:",
  USER_PREFIX: "user:",
  FLOW_PREFIX: "flow:",
} as const;

export function getOrgRoom(orgId: string): string {
  return `${ROOMS.ORG_PREFIX}${orgId}`;
}

export function getWorkspaceRoom(workspaceId: string): string {
  return `${ROOMS.WORKSPACE_PREFIX}${workspaceId}`;
}

export function getUserRoom(userId: string): string {
  return `${ROOMS.USER_PREFIX}${userId}`;
}

export function getFlowRoom(flowId: string): string {
  return `${ROOMS.FLOW_PREFIX}${flowId}`;
}

export function isOrgRoom(room: string): boolean {
  return room.startsWith(ROOMS.ORG_PREFIX);
}

export function isWorkspaceRoom(room: string): boolean {
  return room.startsWith(ROOMS.WORKSPACE_PREFIX);
}

export function extractIdFromRoom(room: string, prefix: string): string {
  return room.slice(prefix.length);
}
