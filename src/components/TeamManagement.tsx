import React, { useState } from 'react';
import { Users, UserPlus, Shield, Settings, Crown, Eye, Edit, Trash2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatar: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  permissions: string[];
  projects: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  projects: string[];
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    defaultRole: string;
  };
}

const SAMPLE_TEAM: Team = {
  id: '1',
  name: 'Development Team',
  description: 'Main development team for all projects',
  members: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      status: 'active',
      lastActive: new Date(),
      permissions: ['read', 'write', 'admin', 'deploy'],
      projects: ['project-1', 'project-2', 'project-3']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      status: 'active',
      lastActive: new Date(Date.now() - 3600000),
      permissions: ['read', 'write', 'admin'],
      projects: ['project-1', 'project-2']
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      status: 'active',
      lastActive: new Date(Date.now() - 7200000),
      permissions: ['read', 'write'],
      projects: ['project-1']
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: 'viewer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      status: 'pending',
      lastActive: new Date(Date.now() - 86400000),
      permissions: ['read'],
      projects: ['project-2']
    }
  ],
  projects: ['project-1', 'project-2', 'project-3'],
  settings: {
    allowInvites: true,
    requireApproval: true,
    defaultRole: 'developer'
  }
};

export function TeamManagement() {
  const [team, setTeam] = useState<Team>(SAMPLE_TEAM);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('developer');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      case 'developer': return Edit;
      case 'viewer': return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-500 bg-yellow-100';
      case 'admin': return 'text-red-500 bg-red-100';
      case 'developer': return 'text-blue-500 bg-blue-100';
      case 'viewer': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100';
      case 'inactive': return 'text-gray-500 bg-gray-100';
      case 'pending': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://ui-avatars.com/api/?name=${inviteEmail}&background=random`,
      status: 'pending',
      lastActive: new Date(),
      permissions: getDefaultPermissions(inviteRole),
      projects: []
    };

    setTeam({
      ...team,
      members: [...team.members, newMember]
    });

    setInviteEmail('');
    setShowInviteModal(false);
  };

  const getDefaultPermissions = (role: TeamMember['role']): string[] => {
    switch (role) {
      case 'owner': return ['read', 'write', 'admin', 'deploy', 'manage'];
      case 'admin': return ['read', 'write', 'admin', 'deploy'];
      case 'developer': return ['read', 'write'];
      case 'viewer': return ['read'];
      default: return ['read'];
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setTeam({
      ...team,
      members: team.members.filter(m => m.id !== memberId)
    });
    if (selectedMember?.id === memberId) {
      setSelectedMember(null);
    }
  };

  const handleUpdateMemberRole = (memberId: string, newRole: TeamMember['role']) => {
    setTeam({
      ...team,
      members: team.members.map(m =>
        m.id === memberId
          ? { ...m, role: newRole, permissions: getDefaultPermissions(newRole) }
          : m
      )
    });
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Team Members List */}
      <div className="w-2/3 p-4 border-r border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{team.name}</h2>
            <p className="text-gray-400 text-sm">{team.description}</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.members.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMember?.id === member.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RoleIcon className="h-4 w-4 text-gray-400" />
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatLastActive(member.lastActive)}
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  {member.projects.length} project{member.projects.length !== 1 ? 's' : ''}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Member Details */}
      <div className="w-1/3 p-4">
        {selectedMember ? (
          <div className="space-y-6">
            {/* Member Info */}
            <div className="text-center">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-white">{selectedMember.name}</h3>
              <p className="text-gray-400">{selectedMember.email}</p>
              
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`px-3 py-1 text-sm rounded ${getRoleColor(selectedMember.role)}`}>
                  {selectedMember.role}
                </span>
                <span className={`px-3 py-1 text-sm rounded ${getStatusColor(selectedMember.status)}`}>
                  {selectedMember.status}
                </span>
              </div>
            </div>

            {/* Role Management */}
            <div>
              <h4 className="font-medium text-white mb-3">Role & Permissions</h4>
              
              <div className="space-y-2 mb-4">
                <label className="block text-sm text-gray-400">Role</label>
                <select
                  value={selectedMember.role}
                  onChange={(e) => handleUpdateMemberRole(selectedMember.id, e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                <div className="space-y-1">
                  {selectedMember.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-300 capitalize">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div>
              <h4 className="font-medium text-white mb-3">Projects</h4>
              {selectedMember.projects.length > 0 ? (
                <div className="space-y-2">
                  {selectedMember.projects.map((project) => (
                    <div key={project} className="p-2 bg-gray-800 rounded text-sm text-gray-300">
                      {project}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No projects assigned</p>
              )}
            </div>

            {/* Activity */}
            <div>
              <h4 className="font-medium text-white mb-3">Activity</h4>
              <div className="text-sm text-gray-400">
                Last active: {formatLastActive(selectedMember.lastActive)}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Send email functionality
                  window.open(`mailto:${selectedMember.email}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </button>
              
              {selectedMember.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(selectedMember.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Member</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a team member to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}