/**
 * Task repository — abstract interface.
 *
 * Every function returns a Promise (except `getColumnsByTeam`, which is a
 * synchronous pure function because columns are static). Swap the re-export
 * source below to change the backing implementation:
 *
 *   - `./liveTaskRepository` — hits the real HTTP API (production path).
 *   - `./mockTaskRepository`  — in-memory, seeded from `../data/mockData`
 *                               (for local dev without a running server).
 *
 * Callers must `await` every function (except `getColumnsByTeam`). Treating
 * them as sync stores a Promise in React state and breaks rendering.
 */
export {
  getTeams,
  getTeamById,
  getColumnsByTeam,
  getMembersByTeam,
  getTasksByTeam,
  getMyTasks,
  addTask,
  saveTaskMove,
  updateTask,
  deleteTask,
  getCommentsByTask,
  addComment,
  updateComment,
  deleteComment,
  createTeam,
  renameTeamById,
  updateTeamIcon,
  deleteTeamById,
  inviteMemberToTeam,
  kickMemberFromTeam,
  getStatsByTeam,
  getMemberPetalsByTeam,
} from './liveTaskRepository'
