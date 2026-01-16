import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
import Swal from "sweetalert2";
// Define the structure based on your API response
interface Plant {
  PLANT: string;
  ROLES: Array<{
    ROLE: string;
    ACTIVITIES: Array<{ ACTIVITY: string }>;
  }>;
}

interface UserData {
  USER: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL: string;
  STATUS: string;
  CONTACT: string;
  PLANTS: Plant[];
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
  webUser: string;
  selectedPlant: string;
  selectedRole: string;
  setSelectedPlant: (plant: string) => void;
  setSelectedRole: (role: string) => void;
  activities: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  useEffect(() => {
    // Check if user is already logged in via localStorage
    const savedUser = localStorage.getItem('gate_entry_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  // Initialize defaults when user logs in
  useEffect(() => {

    const savedUser = localStorage.getItem('gate_entry_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);

      // Auto-select first plant and its first role
      if (parsed.PLANTS?.length > 0) {
        const firstPlant = parsed.PLANTS[0];
        setSelectedPlant(firstPlant.PLANT);
        if (firstPlant.ROLES?.length > 0) {
          setSelectedRole(firstPlant.ROLES[0].ROLE);
        }
        console.log("firstPlant", firstPlant)
      }
    }
    setLoading(false);
  }, []);
  // Derive activities based on selection
  const activities = useMemo(() => {
    if (!user || !selectedPlant || !selectedRole) return [];
    const plant = user.PLANTS.find(p => p.PLANT === selectedPlant);
    const role = plant?.ROLES.find(r => r.ROLE === selectedRole);
    return role?.ACTIVITIES.map(a => a.ACTIVITY) || [];
  }, [user, selectedPlant, selectedRole]);
  const signIn = async (username: string, password: string) => {
    try {
      
      const response = await fetch(`${BASE_URL}api/external/Gate_Entry/Login_Submit_Authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LOGIN: {
            USER: username,
            PASSWORD: password
          }
        }),
      });

      const data = await response.json();
      console.log("response", response, data)

      if (response.ok && data.USER) {
        localStorage.setItem('gate_entry_user', JSON.stringify(data));
        setUser(data);
        // FORCE SELECTION TO INDEX 0 ON LOGIN
        if (data.PLANTS && data.PLANTS.length > 0) {
          const firstPlant = data.PLANTS[0];
          setSelectedPlant(String(firstPlant.PLANT)); // Force index 0
          const plantId = String(firstPlant.PLANT);
          setSelectedPlant(plantId);
          // 3. Persist to localStorage
          localStorage.setItem('SelectedPlant', plantId);
          if (firstPlant.ROLES && firstPlant.ROLES.length > 0) {
            setSelectedRole(firstPlant.ROLES[0].ROLE); // Force index 0
          } else {
            setSelectedRole("");
          }
          console.log("firstPlant", firstPlant)
        }


        return { error: null };
        return { error: null };
      } else {
        Swal.fire({
          title: "Error",
          text: data.MESSAGE,
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return
        { error: { message: data.MESSAGE || 'Invalid Credentials' } };
      }
    } catch (err) {
      return { error: { message: 'Server connection failed' } };
    }
  };

  const signOut = () => {
    localStorage.removeItem('gate_entry_user');
    setUser(null);
  };

  const webUser = user ? `${user.FIRST_NAME} ${user.LAST_NAME}` : 'Guest';

  return (
    <AuthContext.Provider value={{
      user, selectedPlant, setSelectedPlant,
      selectedRole, setSelectedRole, activities, loading, signIn, signOut, webUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}