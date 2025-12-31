import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Shield, Users, Check, X, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Swal from "sweetalert2";

import { toast } from 'sonner';
import service from "../services/generalservice.js";
import { useEffect } from 'react';



interface User {
  id: string;
  plant: string;
  userId: string;
  fullName: string;
  emailId: string;
  contactNumber: string;
  role: string;
  password?: string;

  status: 'Active' | 'Inactive';
}

interface Role {
  id: string;
  roleName: string;
  roleDescription: string;
  permissions: string[];
}

// All sidebar screen permissions
const allScreenPermissions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'inward-po', label: 'Inward - With Reference PO' },
  { key: 'inward-subcontracting', label: 'Inward - Subcontracting' },
  { key: 'inward-without-ref', label: 'Inward - Without Reference' },
  { key: 'outward-billing', label: 'Outward - Billing Reference' },
  { key: 'outward-non-returnable', label: 'Outward - Non-Returnable' },
  { key: 'outward-returnable', label: 'Outward - Returnable' },
  { key: 'change', label: 'Change Entry' },
  { key: 'display', label: 'Display Entry' },
  { key: 'exit', label: 'Vehicle Exit' },
  { key: 'cancel', label: 'Cancel Entry' },
  { key: 'print', label: 'Print Entry' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'help', label: 'Help & Support' },
];

const plantOptions = [
  { value: 'P001', label: 'P001 - Mumbai Plant' },
  { value: 'P002', label: 'P002 - Delhi Plant' },
  { value: 'P003', label: 'P003 - Chennai Plant' },
  { value: 'P004', label: 'P004 - Bangalore Plant' },
];

const initialRoles: Role[] = [
  { id: '1', roleName: 'Admin', roleDescription: 'Full system access with all permissions. Can manage users, roles, and system settings.', permissions: allScreenPermissions.map(p => p.key) },
  { id: '2', roleName: 'Security', roleDescription: 'Gate security operations for inward and outward entries.', permissions: ['dashboard', 'inward-po', 'inward-subcontracting', 'inward-without-ref', 'outward-billing', 'outward-non-returnable', 'outward-returnable', 'exit', 'display', 'print'] },
  { id: '3', roleName: 'Stores', roleDescription: 'Stores management operations including inventory and material handling.', permissions: ['dashboard', 'inward-po', 'inward-subcontracting', 'change', 'display', 'reports'] },
  { id: '4', roleName: 'Finance', roleDescription: 'Reports, analytics, and financial data access only.', permissions: ['dashboard', 'display', 'reports', 'print'] },
  { id: '5', roleName: 'Viewer', roleDescription: 'Read-only access to view entries and reports.', permissions: ['dashboard', 'display', 'reports'] },
];




export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Users & Roles
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);


  // Filtered users based on search
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.userId.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.emailId.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // User Dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    plant: '',
    userId: '',
    fullName: '',
    emailId: '',
    contactNumber: '',
    password: '',
    role: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // Role Dialog
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    roleName: '',
    roleDescription: '',
    permissions: [] as string[],
  });

  // Permissions Dialog
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  // User handlers
  const openAddUserDialog = () => {
    setEditingUser(null);
    setUserForm({
      plant: '',
      userId: '',
      fullName: '',
      emailId: '',
      contactNumber: '',
      role: '',
      password: '',
      status: 'Active',
    });
    setIsUserDialogOpen(true);
  };



  const handleSaveUser = async () => {
    if (
      !userForm.plant ||
      !userForm.userId ||
      !userForm.fullName ||
      !userForm.emailId ||
      !userForm.contactNumber ||
      !userForm.role ||
      !userForm.password ||
      !userForm.status ||
      (!editingUser && !userForm.password)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const [firstName, ...lastNameArr] = userForm.fullName.trim().split(" ");
    const lastName = lastNameArr.join(" ") || "";

    try {
      // ================= EDIT USER =================
      if (editingUser) {
        const payload = {
          EDIT: {
            USER: userForm.userId,
            FIRST_NAME: firstName,
            LAST_NAME: lastName,
            PLANT: userForm.plant,
            ROLE: userForm.role,
            EMAIL: userForm.emailId,
            CONTACT: userForm.contactNumber,
            PASSWORD: userForm.password,  // or empty if backend ignores
            STATUS: userForm.status


          },
        };

        if (userForm.password?.trim()) {
          payload.EDIT.PASSWORD = userForm.password;
        }

        const res = await service.UserEdit(payload);

        if (res?.STATUS === "TRUE") {
          toast.success(res.MESSAGE || "User updated successfully");

          // 🔥 Update UI list
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? {
                  ...u,
                  plant: userForm.plant,
                  fullName: userForm.fullName,
                  emailId: userForm.emailId,
                  contactNumber: userForm.contactNumber,
                  role: userForm.role,
                }
                : u
            )
          );

          setIsUserDialogOpen(false);
          setEditingUser(null);
        } else {
          toast.error(res?.MESSAGE || "User update failed");
        }

        return;
      }

      // ================= ADD USER =================
      const payload = {
        CREATE: {
          USER: userForm.userId,
          FIRST_NAME: firstName,
          LAST_NAME: lastName,
          PLANT: userForm.plant,
          ROLE: userForm.role,
          EMAIL: userForm.emailId,
          CONTACT: userForm.contactNumber,
          PASSWORD: userForm.password,
          STATUS: userForm.status

        },
      };

      const res = await service.AddUser(payload);

      if (res?.STATUS === "TRUE") {
        toast.success(res.MESSAGE || "User created successfully");

        setUsers((prev) => [
          ...prev,
          {
            id: userForm.userId,
            plant: userForm.plant,
            userId: userForm.userId,
            fullName: userForm.fullName,
            emailId: userForm.emailId,
            contactNumber: userForm.contactNumber,
            role: userForm.role,
            status: userForm.status,

          },
        ]);

        setIsUserDialogOpen(false);
      } else {
        toast.error(res?.MESSAGE || "User creation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setUserForm({
      plant: user.plant,
      userId: user.userId,
      fullName: user.fullName,
      emailId: user.emailId,
      contactNumber: user.contactNumber,
      role: user.role,
      password: user.password,
      status: user.status,
    });
    setIsUserDialogOpen(true);
  };



  const fetchUsers = async () => {
    try {
      const res = await service.DisplayTable();

      if (Array.isArray(res)) {
        const mappedUsers: User[] = res.map((item) => ({
          id: item.ZUSER,
          plant: item.ZWERKS,
          userId: item.ZUSER,
          fullName: `${item.ZFIRST_NAME} ${item.ZLAST_NAME}`,
          emailId: item.ZEMAIL,
          contactNumber: item.ZCONTACT,
          role: item.ZROLE,
          status: item.ZSTATUS === "Inactive" ? "Inactive" : "Active",
        }));

        setUsers(mappedUsers);
      } else {
        toast.error("Invalid user data received");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);




  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success('User removed!');
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    ));
  };

  // Role handlers
  const openAddRoleDialog = () => {
    setEditingRole(null);
    setRoleForm({
      roleName: '',
      roleDescription: '',
      permissions: [],
    });
    setIsRoleDialogOpen(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      permissions: [...role.permissions],
    });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.roleName || !roleForm.roleDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      CREATE: {
        ROLE: roleForm.roleName,
        ROLE_DES: roleForm.roleDescription,
        ACTIVITY: roleForm.permissions.map(p => ({
          ACTIVITY: p
        }))
      }
    };

    try {
      const res = await service.UserRoleCreation(payload);
      if (res.STATUS === "SUCCESS") {
        Swal.fire(
          "Success",
          "User Role created successfully",
          "success"
        );

        // UI update (simple)
        setRoles(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            roleName: roleForm.roleName,
            roleDescription: roleForm.roleDescription,
            permissions: roleForm.permissions
          }
        ]);

        setIsRoleDialogOpen(false);
      } else {
        toast.error(res.MESSAGE || "Failed");
      }
    } catch (err) {
      toast.error("API Error");
    }
  };



  const handleDeleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete?.roleName === 'Admin') {
      toast.error('Cannot delete Admin role');
      return;
    }
    setRoles(roles.filter(r => r.id !== id));
    toast.success('Role removed!');
  };

  const toggleRoleFormPermission = (permKey: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }));
  };

  // Permissions handlers
  const openPermissionsDialog = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setTempPermissions([...role.permissions]);
    setIsPermissionsDialogOpen(true);
  };

  const togglePermission = (permKey: string) => {
    setTempPermissions(prev =>
      prev.includes(permKey)
        ? prev.filter(p => p !== permKey)
        : [...prev, permKey]
    );
  };

  const handleSavePermissions = () => {
    if (selectedRoleForPermissions) {
      setRoles(roles.map(r =>
        r.id === selectedRoleForPermissions.id
          ? { ...r, permissions: tempPermissions }
          : r
      ));
      toast.success(`Permissions for ${selectedRoleForPermissions.roleName} saved!`);
    }
    setIsPermissionsDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Settings"
        subtitle="Configure users and roles"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid max-w-md">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4 hidden sm:block" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="w-4 h-4 hidden sm:block" />
            Roles
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <FormSection
            title="User Management"
            actions={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button onClick={openAddUserDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            }
          >
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Plant</TableHead>
                    <TableHead className="font-semibold">User Id</TableHead>
                    <TableHead className="font-semibold">Full Name</TableHead>
                    <TableHead className="font-semibold">Email Id</TableHead>
                    <TableHead className="font-semibold">Contact Number</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No users found matching "{userSearchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{user.plant}</TableCell>
                        <TableCell className="font-mono text-sm">{user.userId}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.emailId}</TableCell>
                        <TableCell>{user.contactNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.status === 'Active'}
                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              onClick={() => openEditUserDialog(user)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </FormSection>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <FormSection
            title="Role Management"
            actions={
              <Button onClick={openAddRoleDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Role
              </Button>
            }
          >
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[180px]">Role Name</TableHead>
                    <TableHead className="font-semibold">Role Description</TableHead>
                    <TableHead className="font-semibold w-[200px] text-center">Screen Permissions</TableHead>
                    <TableHead className="font-semibold w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Badge variant="outline" className="font-medium text-sm px-3 py-1">
                          {role.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{role.roleDescription}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPermissionsDialog(role)}
                          className="gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          Manage ({role.permissions.length})
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => openEditRoleDialog(role)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={role.roleName === 'Admin'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4 overflow-y-auto">

            <div className="space-y-5 py-4">

              <SelectField
                label="Plant"
                value={userForm.plant}
                onChange={(value) => setUserForm({ ...userForm, plant: value })}
                options={plantOptions}
                placeholder="Select plant"
                required
              />
              <TextField
                label="User ID"
                value={userForm.userId}
                onChange={(value) => setUserForm({ ...userForm, userId: value })}
                placeholder="Enter User ID (e.g., USR001)"
                required
              />
              <TextField
                label="Full Name"
                value={userForm.fullName}
                onChange={(value) => setUserForm({ ...userForm, fullName: value })}
                placeholder="Enter full name"
                required
              />
              <TextField
                label="Email ID"
                type="email"
                value={userForm.emailId}
                onChange={(value) => setUserForm({ ...userForm, emailId: value })}
                placeholder="Enter email"
                required
              />
              <TextField
                label="Contact Number"
                value={userForm.contactNumber}
                onChange={(value) => setUserForm({ ...userForm, contactNumber: value })}
                placeholder="Enter contact number"
                required
              />
              <SelectField
                label="Role"
                value={userForm.role}
                onChange={(value) => setUserForm({ ...userForm, role: value })}
                options={roles.map(r => ({ value: r.roleName, label: r.roleName }))}
                placeholder="Select role"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(value) =>
                  setUserForm({ ...userForm, password: value })
                }
                placeholder="Enter password"

              />
              <SelectField
                label="Status"
                value={userForm.status}
                onChange={(value) =>
                  setUserForm({
                    ...userForm,
                    status: value as 'Active' | 'Inactive',
                  })
                }
                options={[

                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                required
              />
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <TextField
                label="Role Name"
                value={roleForm.roleName}
                onChange={(value) => setRoleForm({ ...roleForm, roleName: value })}
                placeholder="Enter role name"
                required
              />
              <div className="space-y-2">
                <Label>Role Description</Label>
                <Textarea
                  value={roleForm.roleDescription}
                  onChange={(e) => setRoleForm({ ...roleForm, roleDescription: e.target.value })}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>

              {/* Screen Permissions Assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Screen Permissions</Label>
                  <span className="text-sm text-muted-foreground">
                    {roleForm.permissions.length} of {allScreenPermissions.length} assigned
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Select which screens this role can access
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleForm({ ...roleForm, permissions: allScreenPermissions.map(p => p.key) })}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleForm({ ...roleForm, permissions: [] })}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {allScreenPermissions.map((screen) => {
                    const isAssigned = roleForm.permissions.includes(screen.key);
                    return (
                      <div
                        key={screen.key}
                        onClick={() => toggleRoleFormPermission(screen.key)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isAssigned
                          ? 'border-primary bg-primary/5 hover:bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                          }`}
                      >
                        <span className={`text-sm font-medium ${isAssigned ? 'text-primary' : 'text-foreground'}`}>
                          {screen.label}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isAssigned
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                          }`}>
                          {isAssigned ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screen Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Screen Permissions - {selectedRoleForPermissions?.roleName}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Assign or unassign screen access for this role.
                </p>
                {selectedRoleForPermissions?.roleName !== 'Admin' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTempPermissions(allScreenPermissions.map(p => p.key))}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTempPermissions([])}
                    >
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allScreenPermissions.map((screen) => {
                  const isAssigned = tempPermissions.includes(screen.key);
                  return (
                    <div
                      key={screen.key}
                      onClick={() => selectedRoleForPermissions?.roleName !== 'Admin' && togglePermission(screen.key)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isAssigned
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                        } ${selectedRoleForPermissions?.roleName === 'Admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <span className={`text-sm font-medium ${isAssigned ? 'text-primary' : 'text-foreground'}`}>
                        {screen.label}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isAssigned
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {isAssigned ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedRoleForPermissions?.roleName === 'Admin' && (
                <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                  ⚠️ Admin role has full access to all screens and cannot be modified.
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSavePermissions}
              className="gap-2 bg-primary hover:bg-primary/90"
              disabled={selectedRoleForPermissions?.roleName === 'Admin'}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
