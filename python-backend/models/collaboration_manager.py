import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

@dataclass
class CollaborationSession:
    id: str
    name: str
    code: str
    language: str
    participants: List[str]
    created_at: datetime
    last_activity: datetime
    is_active: bool

@dataclass
class Participant:
    id: str
    name: str
    cursor_position: Dict[str, int]
    last_seen: datetime
    is_active: bool

class CollaborationManager:
    def __init__(self):
        self.sessions: Dict[str, CollaborationSession] = {}
        self.participants: Dict[str, Dict[str, Participant]] = {}
        self.session_locks: Dict[str, asyncio.Lock] = {}
    
    async def create_session(self, session_name: str, initial_code: str = "") -> Dict[str, Any]:
        """Create a new collaboration session"""
        session_id = str(uuid.uuid4())
        
        session = CollaborationSession(
            id=session_id,
            name=session_name,
            code=initial_code,
            language="python",
            participants=[],
            created_at=datetime.now(),
            last_activity=datetime.now(),
            is_active=True
        )
        
        self.sessions[session_id] = session
        self.participants[session_id] = {}
        self.session_locks[session_id] = asyncio.Lock()
        
        return {
            "session_id": session_id,
            "session_name": session_name,
            "code": initial_code,
            "participants": [],
            "created_at": session.created_at.isoformat()
        }
    
    async def join_session(self, session_id: str, participant_name: str) -> Dict[str, Any]:
        """Join an existing collaboration session"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        participant_id = str(uuid.uuid4())
        
        participant = Participant(
            id=participant_id,
            name=participant_name,
            cursor_position={"line": 1, "column": 1},
            last_seen=datetime.now(),
            is_active=True
        )
        
        async with self.session_locks[session_id]:
            self.participants[session_id][participant_id] = participant
            session.participants.append(participant_id)
            session.last_activity = datetime.now()
        
        return {
            "participant_id": participant_id,
            "session": asdict(session),
            "current_code": session.code,
            "participants": [asdict(p) for p in self.participants[session_id].values()]
        }
    
    async def leave_session(self, session_id: str, participant_id: str) -> bool:
        """Leave a collaboration session"""
        if session_id not in self.sessions or participant_id not in self.participants[session_id]:
            return False
        
        async with self.session_locks[session_id]:
            # Remove participant
            del self.participants[session_id][participant_id]
            
            # Update session
            session = self.sessions[session_id]
            if participant_id in session.participants:
                session.participants.remove(participant_id)
            
            session.last_activity = datetime.now()
            
            # Deactivate session if no participants
            if not session.participants:
                session.is_active = False
        
        return True
    
    async def update_code(self, session_id: str, participant_id: str, new_code: str) -> Dict[str, Any]:
        """Update code in a collaboration session"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        if participant_id not in self.participants[session_id]:
            raise ValueError(f"Participant {participant_id} not in session")
        
        async with self.session_locks[session_id]:
            session = self.sessions[session_id]
            session.code = new_code
            session.last_activity = datetime.now()
            
            # Update participant activity
            participant = self.participants[session_id][participant_id]
            participant.last_seen = datetime.now()
        
        return {
            "session_id": session_id,
            "updated_code": new_code,
            "updated_by": participant_id,
            "timestamp": session.last_activity.isoformat()
        }
    
    async def update_cursor(self, session_id: str, participant_id: str, cursor_position: Dict[str, int]) -> bool:
        """Update participant cursor position"""
        if session_id not in self.sessions or participant_id not in self.participants[session_id]:
            return False
        
        participant = self.participants[session_id][participant_id]
        participant.cursor_position = cursor_position
        participant.last_seen = datetime.now()
        
        return True
    
    async def get_session_state(self, session_id: str) -> Dict[str, Any]:
        """Get current session state"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        participants = self.participants[session_id]
        
        return {
            "session": asdict(session),
            "participants": [asdict(p) for p in participants.values()],
            "active_participants": len([p for p in participants.values() if p.is_active])
        }
    
    async def get_active_sessions(self) -> List[Dict[str, Any]]:
        """Get all active collaboration sessions"""
        active_sessions = []
        
        for session in self.sessions.values():
            if session.is_active:
                participants = self.participants[session.id]
                active_sessions.append({
                    "session_id": session.id,
                    "name": session.name,
                    "participant_count": len(session.participants),
                    "active_participants": len([p for p in participants.values() if p.is_active]),
                    "last_activity": session.last_activity.isoformat(),
                    "created_at": session.created_at.isoformat()
                })
        
        return active_sessions
    
    async def cleanup_inactive_sessions(self, timeout_minutes: int = 30):
        """Clean up inactive sessions"""
        current_time = datetime.now()
        sessions_to_remove = []
        
        for session_id, session in self.sessions.items():
            time_diff = (current_time - session.last_activity).total_seconds() / 60
            
            if time_diff > timeout_minutes:
                sessions_to_remove.append(session_id)
        
        for session_id in sessions_to_remove:
            await self._remove_session(session_id)
    
    async def _remove_session(self, session_id: str):
        """Remove a session and clean up resources"""
        if session_id in self.sessions:
            del self.sessions[session_id]
        
        if session_id in self.participants:
            del self.participants[session_id]
        
        if session_id in self.session_locks:
            del self.session_locks[session_id]
    
    async def get_session_history(self, session_id: str) -> Dict[str, Any]:
        """Get session history and statistics"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        participants = self.participants[session_id]
        
        # Calculate statistics
        total_participants = len(session.participants)
        active_participants = len([p for p in participants.values() if p.is_active])
        session_duration = (datetime.now() - session.created_at).total_seconds() / 60
        
        return {
            "session_id": session_id,
            "name": session.name,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "duration_minutes": round(session_duration, 2),
            "total_participants": total_participants,
            "active_participants": active_participants,
            "code_length": len(session.code),
            "language": session.language
        }