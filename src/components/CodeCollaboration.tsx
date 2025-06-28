import React, { useState, useEffect } from 'react';
import { Users, Share2, Eye, Edit3, MessageCircle, Clock } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface CollaborationSession {
  id: string;
  name: string;
  participants: string[];
  lastActivity: Date;
  isActive: boolean;
}

interface CodeComment {
  id: string;
  line: number;
  author: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

export function CodeCollaboration() {
  const { state } = useAgent();
  const [sessions, setSessions] = useState<CollaborationSession[]>([
    {
      id: '1',
      name: 'React Component Review',
      participants: ['Alice', 'Bob', 'Charlie'],
      lastActivity: new Date(),
      isActive: true
    },
    {
      id: '2',
      name: 'API Integration',
      participants: ['David', 'Eve'],
      lastActivity: new Date(Date.now() - 3600000),
      isActive: false
    }
  ]);

  const [comments, setComments] = useState<CodeComment[]>([
    {
      id: '1',
      line: 15,
      author: 'Alice',
      content: 'Consider using useCallback here for better performance',
      timestamp: new Date(),
      resolved: false
    },
    {
      id: '2',
      line: 23,
      author: 'Bob',
      content: 'This error handling could be more specific',
      timestamp: new Date(Date.now() - 1800000),
      resolved: true
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(true);

  const activeFile = state.projectFiles.find(f => f.id === state.activeFile);

  const handleAddComment = () => {
    if (!newComment.trim() || selectedLine === null) return;

    const comment: CodeComment = {
      id: Date.now().toString(),
      line: selectedLine,
      author: 'You',
      content: newComment,
      timestamp: new Date(),
      resolved: false
    };

    setComments([...comments, comment]);
    setNewComment('');
    setSelectedLine(null);
  };

  const handleResolveComment = (commentId: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, resolved: true }
        : comment
    ));
  };

  const getLineComments = (line: number) => {
    return comments.filter(comment => comment.line === line && !comment.resolved);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg border ${
                session.isActive
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{session.name}</h4>
                <div className="flex items-center space-x-1">
                  {session.isActive ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <Clock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-3 w-3" />
                <span>{session.participants.length} participants</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {session.participants.map((participant, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white rounded text-xs text-gray-700"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary w-full mt-4 flex items-center justify-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Start New Session</span>
        </button>
      </div>

      {/* Code Comments */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Code Comments</h3>
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`btn-secondary flex items-center space-x-2 ${
              showComments ? 'bg-primary-100' : ''
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{showComments ? 'Hide' : 'Show'} Comments</span>
          </button>
        </div>

        {showComments && (
          <div className="space-y-4">
            {/* Add Comment Form */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Edit3 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Add Comment</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Line Number</label>
                  <input
                    type="number"
                    value={selectedLine || ''}
                    onChange={(e) => setSelectedLine(parseInt(e.target.value) || null)}
                    placeholder="Enter line number"
                    className="input-field text-sm"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Comment</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    className="input-field text-sm resize-none"
                    rows={3}
                  />
                </div>
                
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || selectedLine === null}
                  className="btn-primary text-sm"
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border ${
                      comment.resolved
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          Line {comment.line}
                        </span>
                        <span className="text-xs text-gray-400">
                          {comment.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {!comment.resolved && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    
                    {comment.resolved && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}