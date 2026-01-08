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
  plant: string[];
  userId: string;
  fullName: string;
  emailId: string;
  contactNumber: string;
  role: string[];
  password?: string;

  status: 'Active' | 'Inactive';
}

interface Role {
  id: string;
  werks: string;
  roleName: string;
  roleDescription: string;
  permissions: string[];
}

// All sidebar screen permissions
const allScreenPermissions = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'InwardPOReference', label: 'Inward - With Reference PO' },
  { key: 'InwardSubcontracting', label: 'Inward - Subcontracting' },
  { key: 'InwardWithoutReference', label: 'Inward - Without Reference' },
  { key: 'OutwardBillingReference', label: 'Outward - Billing Reference' },
  { key: 'OutwardNonReturnable', label: 'Outward - Non-Returnable' },
  { key: 'OutwardReturnable', label: 'Outward - Returnable' },
  { key: 'ChangeEntry', label: 'Change Entry' },
  { key: 'Display', label: 'Display Entry' },
  { key: 'VehicleExit', label: 'Vehicle Exit' },
  { key: 'Cancel', label: 'Cancel Entry' },
  { key: 'Print', label: 'Print Entry' },
  { key: 'Report', label: 'Reports' },
  { key: 'Settings', label: 'Settings' },
  { key: 'Help', label: 'Help & Support' },
];



export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'PLANT' | 'ROLE' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openViewDialog = (user: User, type: 'PLANT' | 'ROLE') => {
    setSelectedUser(user);
    setViewType(type);
    setIsViewDialogOpen(true);
  };


  const [plantOptions, setPlantOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Users & Roles
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [plantRoles, setPlantRoles] = useState<Role[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);



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
    plant: [] as string[],
    userId: '',
    fullName: '',
    emailId: '',
    contactNumber: '',
    password: '',
    role: [] as string[],
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


  const fetchPlants = async () => {
    console.log("fetchPlants() triggered");

    try {
      const res = await service.UserPlant();

      console.log("fetchPlants:", res);

      if (!Array.isArray(res)) {
        toast.error("Invalid plant data");
        return;
      }

      const options = res.map((item: any) => ({
        value: item.WERKS,
        label: item.WERKS,
      }));

      console.log("plantOptions mapped:", options);

      setPlantOptions(options);
    } catch (error) {
      console.error(" fetchPlants error:", error);
      toast.error("Failed to fetch plants");
    }
  };

  const fetchRolesByPlants = async (plants: string[]) => {
    if (!plants || plants.length === 0) {
      setPlantRoles([]);
      return;
    }

    try {
      const payload = plants.map(p => ({ PLANT: p }));
      console.log("Roles payload:", payload);

      const res = await service.UserRole(payload);
      console.log("Roles response:", res);

      if (!Array.isArray(res) || !res[0]?.ROLES) {
        console.error("Invalid roles response", res);
        setPlantRoles([]);
        return;
      }

      const rolesArray = res[0].ROLES;

      const mappedRoles: Role[] = rolesArray.map((r: any) => ({
        id: `${r.WERKS}-${r.ROLE}`,      // ✅ unique
        werks: r.WERKS,
        roleName: r.ROLE,
        roleDescription: "",
        permissions: [],
      }));

      setPlantRoles(mappedRoles);
    } catch (error) {
      console.error("fetchRolesByPlants error:", error);
      setPlantRoles([]);
    }
  };




  // User handlers
  const openAddUserDialog = () => {
    setEditingUser(null);
    setUserForm({
      plant: [],
      userId: '',
      fullName: '',
      emailId: '',
      contactNumber: '',
      role: [],
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
      !userForm.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const [firstName, ...lastNameArr] = userForm.fullName.trim().split(" ");
    const lastName = lastNameArr.join(" ") || "";

    const payload = {
      CREATE: {
        USER: userForm.userId,
        FIRST_NAME: firstName,
        LAST_NAME: lastName,
        PLANTS: userForm.plant.map(p => ({ WERKS: p })),
        ROLES: userForm.role.map(r => {
          const [werks, roleName] = r.split("-");
          return { WERKS: werks, ROLE: roleName };
        }),
        EMAIL: userForm.emailId,
        CONTACT: userForm.contactNumber,
        PASSWORD: userForm.password,
        STATUS: userForm.status,
      },
    };


    console.log("FINAL PAYLOAD:", payload);

    try {
      const res = await service.AddUser(payload);
      if (res.STATUS === "SUCCESS" || res.STATUS === "TRUE") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User Created Successfully",
          confirmButtonText: "OK",
        });

        setIsUserDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(res?.MESSAGE || "User creation failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleUpdateUser = async () => {
    if (
      !userForm.plant.length ||
      !userForm.userId ||
      !userForm.fullName ||
      !userForm.emailId ||
      !userForm.contactNumber ||
      !userForm.role.length ||
      !userForm.status
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const [firstName, ...lastNameArr] = userForm.fullName.trim().split(" ");
    const lastName = lastNameArr.join(" ") || "";

    const payload: any = {
      EDIT: {
        USER: userForm.userId,
        FIRST_NAME: firstName,
        LAST_NAME: lastName,

        PLANTS: userForm.plant.map(p => ({ WERKS: p })),
        ROLES: userForm.role.map(r => {
          const [werks, roleName] = r.split("-");
          return { WERKS: werks, ROLE: roleName };
        }),

        // ROLES: userForm.plant.flatMap(p =>
        //   userForm.role.map(r => {
        //     const roleName = r.includes("-") ? r.split("-")[1] : r;
        //     return { WERKS: p, ROLE: roleName };
        //   })
        // ),

        EMAIL: userForm.emailId,
        CONTACT: userForm.contactNumber,
        STATUS: userForm.status,
      },
    };


    if (userForm.password?.trim()) {
      payload.EDIT.PASSWORD = userForm.password;
    }

    console.log("EDIT PAYLOAD:", payload);

    try {
      const res = await service.UserEdit(payload);

      if (res.STATUS === "TRUE" || res.STATUS === "SUCCESS") {
        Swal.fire("Success", "User Updated Successfully", "success");

        if (res.STATUS === "TRUE" || res.STATUS === "SUCCESS") {
          Swal.fire("Success", "User Updated Successfully", "success");

          setIsUserDialogOpen(false);
          setEditingUser(null);


          await fetchUsers();
        }


        setIsUserDialogOpen(false);
        setEditingUser(null);
      } else {
        toast.error(res?.MESSAGE || "User update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };



  const openEditUserDialog = async (user: User) => {
    setEditingUser(user);

    setUserForm({
      plant: [...user.plant],
      userId: user.userId,
      fullName: user.fullName,
      emailId: user.emailId,
      contactNumber: user.contactNumber,
      role: [...user.role],
      password: user.password,
      status: user.status,
    });


    await fetchRolesByPlants(user.plant);

    setIsUserDialogOpen(true);
  };




  const fetchUsers = async () => {
    try {
      const res = await service.DisplayTable();
      console.log("DisplayTable API response:", res);

      if (!Array.isArray(res)) {
        toast.error("Invalid user data received");
        return;
      }

      const userMap: Record<string, User> = {};

      res.forEach((item: any) => {
        if (!userMap[item.ZUSER]) {
          userMap[item.ZUSER] = {
            id: item.ZUSER,
            userId: item.ZUSER,
            fullName: `${item.ZFIRST_NAME} ${item.ZLAST_NAME}`,
            emailId: item.ZEMAIL,
            contactNumber: item.ZCONTACT,
            plant: [],
            role: [],
            password: item.ZPASSWORD,
            status: item.ZSTATUS === "Inactive" ? "Inactive" : "Active",
          };
        }

        // ✅ PLANT
        if (
          item.ZWERKS &&
          !userMap[item.ZUSER].plant.includes(item.ZWERKS)
        ) {
          userMap[item.ZUSER].plant.push(item.ZWERKS);
        }

        // ✅ ROLE 
        if (item.ZWERKS && item.ZROLE) {
          const roleValue = `${item.ZWERKS}-${item.ZROLE}`;

          if (!userMap[item.ZUSER].role.includes(roleValue)) {
            userMap[item.ZUSER].role.push(roleValue);
          }
        }
      });

      setUsers(Object.values(userMap));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };




  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPlants();
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
      console.log("UserRoleCreation API response:", res);

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
            werks: "ALL",
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

  const buildEditPayload = () => ({
    EDIT: {
      ROLE: roleForm.roleName,
      ROLE_DES: roleForm.roleDescription,
      ACTIVITY: roleForm.permissions.map((p) => ({
        ACTIVITY: p,
      })),
    },
  });


  const handleEditRole = async () => {
    try {
      const payload = buildEditPayload();

      const res = await service.UserRoleEdit(payload);
      console.log("UserRoleEdit API response:", res);

      if (res.STATUS === "SUCCESS") {
        Swal.fire(
          "Success",
          "User Role Updated successfully",
          "success"
        );
        setIsRoleDialogOpen(false);
        setEditingRole(null);
        fetchRoles();

      } else {
        toast.error(res.MESSAGE || "Something went wrong");
      }
    } catch (error) {
      toast.error("API Error");
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await service.UserRoleDisplay();

      if (!Array.isArray(res)) {
        toast.error("Invalid role data");
        return;
      }


      const roleMap: Record<string, Role> = {};

      res.forEach((item: any) => {
        const roleName = item.ZROLE;

        if (!roleMap[roleName]) {
          roleMap[roleName] = {
            id: roleName,
            werks: "ALL",
            roleName: roleName,
            roleDescription: item.ZROLE_DES,
            permissions: [],
          };
        }


        if (!roleMap[roleName].permissions.includes(item.ZACTIVITY)) {
          roleMap[roleName].permissions.push(item.ZACTIVITY);
        }
      });


      setRoles(Object.values(roleMap));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch roles");
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

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              Plants: {user.plant.length}
                            </Badge>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openViewDialog(user, 'PLANT')}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>



                        <TableCell className="font-mono text-sm">{user.userId}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.emailId}</TableCell>
                        <TableCell>{user.contactNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">
                              Roles: {user.role.length}
                            </Badge>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openViewDialog(user, 'ROLE')}
                            >
                              View
                            </Button>
                          </div>
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

              <div className="relative w-full">
                <Label>
                  Plant <span className="text-red-500">*</span>
                </Label>

                {/* Dropdown box */}
                <div
                  className="border border-border rounded-lg p-2 cursor-pointer flex justify-between items-center"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  <span>
                    {userForm.plant.length > 0
                      ? plantOptions
                        .filter(p => userForm.plant.includes(p.value))
                        .map(p => p.label)
                        .join(", ")
                      : "-- Select Plants --"}
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Checkbox list dropdown */}
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-border rounded-lg bg-white shadow-lg">
                    {plantOptions.map((plant) => (
                      <label
                        key={plant.value}
                        className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={userForm.plant.includes(plant.value)}
                          onChange={(e) => {
                            const newPlants = e.target.checked
                              ? [...userForm.plant, plant.value]
                              : userForm.plant.filter(p => p !== plant.value);

                            setUserForm(prev => ({
                              ...prev,
                              plant: newPlants,
                              role: [],
                            }));
                            fetchRolesByPlants(newPlants);
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm">{plant.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {userForm.plant.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Please select at least one plant</p>
                )}
              </div>

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
              {/* Role Multi-Select with Checkboxes */}
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>

                <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {userForm.plant.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Please select plant(s) first
                    </p>
                  ) : plantRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No roles available for selected plant(s)
                    </p>
                  ) : (
                    plantRoles.map((role) => {
                      const roleValue = `${role.werks}-${role.roleName}`; // ✅ UNIQUE
                      const roleLabel = `${role.werks} - ${role.roleName}`;

                      return (
                        <div key={role.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={userForm.role.includes(roleValue)}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...userForm.role, roleValue]
                                : userForm.role.filter(r => r !== roleValue);

                              setUserForm(prev => ({ ...prev, role: newRoles }));
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                          />
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {roleLabel}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>

                {userForm.role.length === 0 && userForm.plant.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Please select at least one role
                  </p>
                )}
              </div>



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
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancel
            </Button>

            {/* ADD USER */}
            {!editingUser && (
              <Button
                onClick={handleSaveUser}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}

            {/* EDIT USER */}
            {editingUser && (
              <Button
                onClick={handleUpdateUser}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                Update
              </Button>
            )}
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4 overflow-y-auto">
            <div className="space-y-5 py-4">
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
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>

            {/* SAVE button – CREATE mode */}
            {!editingRole && (
              <Button
                onClick={handleSaveRole}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}

            {/* UPDATE button – EDIT mode */}
            {editingRole && (
              <Button
                onClick={handleEditRole}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                Update
              </Button>
            )}
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
          <ScrollArea className="max-h-[60vh] pr-4 overflow-y-auto">
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md h-[90vh] ml-auto">
          <DialogHeader>
            <DialogTitle>
              {viewType === 'PLANT' ? 'Assigned Plants' : 'Assigned Roles'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedUser?.fullName} ({selectedUser?.userId})
            </p>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            {/* PLANTS VIEW */}
            {viewType === 'PLANT' && (
              <div className="space-y-2">
                {selectedUser?.plant.map((p) => (
                  <div
                    key={p}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{p}</span>
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                ))}
              </div>
            )}

            {/* ROLES VIEW (GROUPED BY PLANT) */}
            {viewType === 'ROLE' && (
              <div className="space-y-4">
                {Object.entries(
                  selectedUser?.role.reduce((acc: any, r) => {
                    const [werks, roleName] = r.split("-");
                    acc[werks] = acc[werks] || [];
                    acc[werks].push(roleName);
                    return acc;
                  }, {}) || {}
                ).map(([werks, roles]) => (
                  <div key={werks} className="border rounded-lg">
                    <div className="px-3 py-2 bg-muted font-semibold">
                      Plant {werks}
                    </div>
                    <div className="p-3 space-y-2">
                      {(roles as string[]).map((role) => (
                        <div
                          key={role}
                          className="flex items-center justify-between"
                        >
                          <span>{role}</span>
                          <Badge variant="outline">{werks}-{role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
