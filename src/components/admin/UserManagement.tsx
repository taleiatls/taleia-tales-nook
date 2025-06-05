
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Coins, Edit } from "lucide-react";

interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
  coin_balance?: number;
}

interface CoinAdjustmentResponse {
  success: boolean;
  new_balance?: number;
  error?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get coin balances for each user
      const usersWithCoins: UserProfile[] = [];
      
      for (const profile of profiles || []) {
        const { data: coinData } = await supabase
          .from('user_coins')
          .select('balance')
          .eq('user_id', profile.id)
          .single();

        usersWithCoins.push({
          ...profile,
          coin_balance: coinData?.balance || 0
        });
      }

      setUsers(usersWithCoins);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !coinAmount) return;

    try {
      const { data, error } = await supabase.rpc('admin_adjust_user_coins', {
        p_target_user_id: selectedUser.id,
        p_amount: parseInt(coinAmount),
        p_description: description || 'Admin adjustment'
      });

      if (error) throw error;

      const response = data as CoinAdjustmentResponse;
      
      if (response?.success) {
        toast.success(`Coins adjusted successfully. New balance: ${response.new_balance}`);
        setIsDialogOpen(false);
        setCoinAmount("");
        setDescription("");
        fetchUsers();
      } else {
        toast.error(response?.error || "Failed to adjust coins");
      }
    } catch (error) {
      console.error("Error adjusting coins:", error);
      toast.error("Failed to adjust coins");
    }
  };

  const openCoinDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setCoinAmount(user.coin_balance?.toString() || "0");
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="text-gray-300">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">Manage Users</h3>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Username</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Coin Balance</TableHead>
              <TableHead className="text-gray-300">Joined</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-gray-700">
                <TableCell className="text-gray-200">
                  {user.username || "No username"}
                </TableCell>
                <TableCell className="text-gray-200">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Coins className="h-3 w-3" />
                    {user.coin_balance || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-200">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => openCoinDialog(user)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Adjust Coins
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle>Adjust Coins for {selectedUser?.username || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustCoins} className="space-y-4">
            <div>
              <Label htmlFor="coinAmount">New Coin Balance</Label>
              <Input
                id="coinAmount"
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
                placeholder="Enter new coin balance"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600"
                placeholder="Reason for adjustment"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Adjust Coins
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
