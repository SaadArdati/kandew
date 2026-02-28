import './Home.css';
import TeamPanel from '../components/TeamPanel';
import KanbanBoard from '../components/KanbanBoard';
import useTeamViewModel from '../viewmodels/useTeamViewModel';
import useBoardViewModel from '../viewmodels/useBoardViewModel';

export default function Home() {
    const {teams, activeTeamId, activeTeamName, selectTeam} = useTeamViewModel();
    const board = useBoardViewModel(activeTeamId);

    return (
        <div className="home-layout">
            <TeamPanel
                teams={teams}
                activeTeam={activeTeamId}
                onSelectTeam={selectTeam}
            />
            <KanbanBoard
                teamName={activeTeamName}
                tasksByColumn={board.tasksByColumn}
                draggedTaskId={board.draggedTaskId}
                dragOverCol={board.dragOverCol}
                dropIndex={board.dropIndex}
                onDragStart={board.handleDragStart}
                onColumnDragOver={board.handleColumnDragOver}
                onDragLeave={board.handleDragLeave}
                onDrop={board.handleDrop}
                onDragEnd={board.handleDragEnd}
            />
        </div>
    );
}
