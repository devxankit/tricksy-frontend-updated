import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Building, 
  Car, 
  Activity,
  LogOut,
  Menu,
  Bell
} from 'lucide-react';

const DashboardLayout = ({ children, user, onLogout }) => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Drivers",
      value: "89",
      change: "+5%",
      icon: Car,
      color: "text-green-600"
    },
    {
      title: "Today's Attendance",
      value: "95%",
      change: "+2%",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Active Routes",
      value: "12",
      change: "+1",
      icon: MapPin,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
              <header className="border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || 'Admin'}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View All Users
                </Button>
                <Button className="w-full">
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Driver Management
              </CardTitle>
              <CardDescription>
                Track drivers and manage assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View Drivers
                </Button>
                <Button className="w-full">
                  Assign Routes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Attendance
              </CardTitle>
              <CardDescription>
                Monitor attendance and leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View Attendance
                </Button>
                <Button className="w-full">
                  Process Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New driver assigned", time: "2 minutes ago", status: "success" },
                { action: "Leave request approved", time: "5 minutes ago", status: "info" },
                { action: "User login detected", time: "10 minutes ago", status: "warning" },
                { action: "Route updated", time: "15 minutes ago", status: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 