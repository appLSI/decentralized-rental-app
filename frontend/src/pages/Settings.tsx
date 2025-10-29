import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Bell,
  Globe,
  Info,
  LogOut,
  Copy,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Fake data for demonstration
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      transaction: true,
      rentReminders: true,
      autoRefresh: true,
      marketing: false,
    },
    privacy: {
      publicProfile: true,
      showWallet: false,
      autoLock: false,
      transactionConfirm: true,
      analytics: true,
    },
    appearance: {
      compactMode: false,
      animations: true,
    },
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const copyAddress = async () => {
    // Fake address for demonstration
    const fakeAddress = "0x742d35Cc6634C0532925a3b8D...";
    await navigator.clipboard.writeText(fakeAddress);
    setCopied(true);
    toast({
      title: "Address copied to clipboard",
      description: "Wallet address has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Customize your RentChain experience.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription>
                  Your wallet details and connection status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Wallet Address
                  </Label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-2 py-1 text-xs bg-muted rounded font-mono">
                      {formatAddress("0x742d35Cc6634C0532925a3b8D")}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className={`shrink-0 ${copied ? "text-green-600" : ""}`}
                      style={{
                        backgroundColor: copied ? "#182a3a" : "",
                        borderColor: "#182a3a",
                        color: copied ? "white" : "",
                      }}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Network
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      Ethereum Mainnet
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Connection Status
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your wallet security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-lock wallet</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically disconnect after inactivity
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.autoLock}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, autoLock: checked },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transaction confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Require confirmation for all transactions
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.transactionConfirm}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          transactionConfirm: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-factor authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: "#182a3a",
                      borderColor: "#182a3a",
                      color: "white",
                    }}
                  >
                    Setup
                  </Button>
                </div>

                <Button variant="destructive" size="sm" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                      style={
                        {
                          "--switch-bg-checked": "#eab308",
                          "--switch-bg-unchecked": "#d1d5db",
                        } as React.CSSProperties
                      }
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show more information in less space
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          compactMode: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and effects
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          animations: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transaction Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of blockchain transactions
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.transaction}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          transaction: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rent reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when rent payments are due
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.rentReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          rentReminders: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-refresh</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh data every 30 seconds
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.autoRefresh}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          autoRefresh: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to others
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.publicProfile}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          publicProfile: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Wallet Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your wallet on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showWallet}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showWallet: checked },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the platform with usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, analytics: checked },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          marketing: checked,
                        },
                      })
                    }
                    style={
                      {
                        "--switch-bg-checked": "#eab308",
                        "--switch-bg-unchecked": "#d1d5db",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>About</span>
                </CardTitle>
                <CardDescription>
                  Application information and support resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <Label className="font-medium text-muted-foreground">
                      Version
                    </Label>
                    <p>RentChain v1.0.0</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">
                      Network
                    </Label>
                    <p>Ethereum Mainnet</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">
                      Build
                    </Label>
                    <p>2025.01.12</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: "#182a3a",
                      borderColor: "#182a3a",
                      color: "white",
                    }}
                  >
                    Documentation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: "#182a3a",
                      borderColor: "#182a3a",
                      color: "white",
                    }}
                  >
                    Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: "#182a3a",
                      borderColor: "#182a3a",
                      color: "white",
                    }}
                  >
                    Privacy Policy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: "#182a3a",
                      borderColor: "#182a3a",
                      color: "white",
                    }}
                  >
                    Terms of Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            style={{
              backgroundColor: "#182a3a",
              borderColor: "#182a3a",
              color: "white",
            }}
          >
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
