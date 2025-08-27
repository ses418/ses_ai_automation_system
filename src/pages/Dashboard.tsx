import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

// Mock data for charts and analytics
const revenueData = [
  { month: 'Jan', revenue: 125, target: 120, growth: 12.5 },
  { month: 'Feb', revenue: 138, target: 125, growth: 10.4 },
  { month: 'Mar', revenue: 142, target: 130, growth: 2.9 },
  { month: 'Apr', revenue: 156, target: 135, growth: 9.9 },
  { month: 'May', revenue: 168, target: 140, growth: 7.7 },
  { month: 'Jun', revenue: 175, target: 145, growth: 4.2 },
];

const pipelineData = [
  { stage: 'Lead', count: 45, conversion: 85, value: 450000 },
  { stage: 'Qualified', count: 32, conversion: 72, value: 320000 },
  { stage: 'Proposal', count: 28, conversion: 65, value: 280000 },
  { stage: 'Negotiation', count: 18, conversion: 58, value: 180000 },
  { stage: 'Closed Won', count: 12, conversion: 100, value: 120000 },
];

const teamPerformance = [
  { name: 'Sarah Johnson', deals: 8, revenue: 245000, target: 200000, avatar: 'SJ' },
  { name: 'Michael Chen', deals: 6, revenue: 198000, target: 180000, avatar: 'MC' },
  { name: 'Emily Rodriguez', deals: 9, revenue: 267000, target: 220000, avatar: 'ER' },
  { name: 'David Kim', deals: 5, revenue: 156000, target: 160000, avatar: 'DK' },
];

const recentActivities = [
  { type: 'proposal', title: 'TechCorp Infrastructure Proposal', status: 'sent', time: '2 hours ago' },
  { type: 'reactivation', title: 'Past Client: Global Solutions Inc', status: 'pending', time: '4 hours ago' },
  { type: 'inquiry', title: 'New Lead: StartupXYZ', status: 'new', time: '6 hours ago' },
  { type: 'report', title: 'Q2 Sales Performance Report', status: 'completed', time: '1 day ago' },
];

const monthlyTrends = [
  { month: 'Jan', proposals: 15, reactivations: 8, inquiries: 22, revenue: 125000 },
  { month: 'Feb', proposals: 18, reactivations: 12, inquiries: 28, revenue: 138000 },
  { month: 'Mar', proposals: 22, reactivations: 15, inquiries: 35, revenue: 142000 },
  { month: 'Apr', proposals: 25, reactivations: 18, inquiries: 42, revenue: 156000 },
  { month: 'May', proposals: 28, reactivations: 22, inquiries: 48, revenue: 168000 },
  { month: 'Jun', proposals: 32, reactivations: 25, inquiries: 55, revenue: 175000 },
];

const departmentPerformance = [
  { department: 'Sales', revenue: 450000, target: 400000, teamSize: 8 },
  { department: 'Marketing', revenue: 320000, target: 300000, teamSize: 6 },
  { department: 'Engineering', revenue: 280000, target: 250000, teamSize: 12 },
  { department: 'Consulting', revenue: 180000, target: 200000, teamSize: 4 },
];

const clientReactivationData = [
  { status: 'Successful', count: 24, percentage: 60, color: 'bg-green-500' },
  { status: 'Pending', count: 12, percentage: 30, color: 'bg-yellow-500' },
  { status: 'Failed', count: 4, percentage: 10, color: 'bg-red-500' },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartAnimation, setChartAnimation] = useState(false);

  // Trigger animation on component mount
  useEffect(() => {
    setChartAnimation(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'new': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Sent';
      case 'pending': return 'Pending';
      case 'new': return 'New';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen page-bg-primary p-6">
      {/* Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Business and Development"
          subtitle="Real-time insights and performance metrics"
          gradient={false}
          children={
            <p className="text-sm text-primary-brand/80 mb-1">Welcome, John Doe</p>
          }
        />
      </div>

      {/* Top Row - Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <Card className="card-glass-primary animate-glass-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-brand/80 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-foreground">$1.1M</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm font-medium">+12.5%</span>
                </div>
              </div>
              <div className="text-primary-brand">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Proposals Card */}
        <Card className="card-glass-secondary animate-glass-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-brand text-sm font-medium">Active Proposals</p>
                <p className="text-3xl font-bold mt-2 text-foreground">28</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm">+8.2%</span>
                </div>
              </div>
              <div className="text-primary-brand">
                <FileText className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value Card */}
        <Card className="card-glass-accent animate-glass-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-brand text-sm font-medium">Pipeline Value</p>
                <p className="text-3xl font-bold mt-2 text-foreground">$2.8M</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-sm">+15.3%</span>
                </div>
              </div>
              <div className="text-primary-brand">
                <Target className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card className="card-glass-primary animate-glass-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">68%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-orange-300 mr-1" />
                  <span className="text-orange-300 text-sm">+5.7%</span>
                </div>
              </div>
              <div className="text-orange-200">
                <BarChart3 className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends Chart - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Chart Bars */}
                <div className="grid grid-cols-6 gap-4">
                  {revenueData.map((month, index) => (
                    <div key={month.month} className="space-y-3">
                      <div className="flex-1 flex justify-center">
                        <div className="relative w-full flex justify-center">
                          {/* Actual Revenue Bar */}
                          <div 
                            className="w-12 bg-green-500 rounded-t-lg transition-all duration-1000 ease-out"
                            style={{ 
                              height: `${(month.revenue / 150) * 200}px`,
                              animationDelay: `${index * 100}ms`
                            }}
                          />
                          {/* Target Bar */}
                          <div 
                            className="w-12 bg-blue-500 rounded-t-lg ml-2 transition-all duration-1000 ease-out"
                            style={{ 
                              height: `${(month.target / 150) * 200}px`,
                              animationDelay: `${index * 100 + 200}ms`
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-sm font-medium text-gray-900">${month.revenue}k</div>
                        <div className="text-xs text-green-600 font-medium">+{month.growth}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium text-gray-700">Actual Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium text-gray-700">Target</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Funnel - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pipelineData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{stage.count}</div>
                        <div className="text-xs text-gray-500">${(stage.value / 1000).toFixed(0)}k</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${stage.conversion}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {stage.conversion}% conversion
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500">{member.deals} deals</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${(member.revenue / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-gray-500">
                      {((member.revenue / member.target) * 100).toFixed(0)}% of target
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)}`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Heatmap */}
      <div className="mt-8">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => {
                const performanceRatio = dept.revenue / dept.target;
                const getPerformanceColor = (ratio: number) => {
                  if (ratio >= 1.2) return 'bg-green-500';
                  if (ratio >= 1.0) return 'bg-blue-500';
                  if (ratio >= 0.8) return 'bg-yellow-500';
                  return 'bg-red-500';
                };
                
                return (
                  <div key={dept.department} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]">
                    <div className="w-24 font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {dept.department}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                          Revenue vs Target
                        </span>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-900 transition-colors">
                          ${(dept.revenue / 1000).toFixed(0)}k / ${(dept.target / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            chartAnimation ? getPerformanceColor(performanceRatio) : 'w-0'
                          }`}
                          style={{ 
                            width: chartAnimation ? `${Math.min(performanceRatio * 100, 100)}%` : '0%',
                            animationDelay: `${index * 300}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${performanceRatio >= 1 ? 'text-green-600' : 'text-red-600'} group-hover:text-gray-900 transition-colors`}>
                        {(performanceRatio * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        {dept.teamSize} members
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}