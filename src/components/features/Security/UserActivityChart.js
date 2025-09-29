/**
 * UserActivityChart.js - Chart component for user activity visualization
 * Shows activity patterns with various chart types
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useActivity } from "../../hooks/useActivity";

const UserActivityChart = ({
  userId = null,
  timeRange = "7d",
  metrics = {},
  chartType = "hourly", // hourly, daily, weekly
  className = "",
}) => {
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [selectedMetric, setSelectedMetric] = useState("count"); // count, duration, risk

  // Fetch activity data
  const { activities, analytics, isLoading } = useActivity(userId, {
    timeRange,
    autoRefresh: true,
  });

  // Process data for different chart types
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    switch (selectedChartType) {
      case "hourly":
        return generateHourlyData(activities, selectedMetric);
      case "daily":
        return generateDailyData(activities, selectedMetric, timeRange);
      case "weekly":
        return generateWeeklyData(activities, selectedMetric);
      case "category":
        return generateCategoryData(activities, selectedMetric);
      default:
        return generateHourlyData(activities, selectedMetric);
    }
  }, [activities, selectedChartType, selectedMetric, timeRange]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.value));
  }, [chartData]);

  const getChartColor = (value, risk) => {
    if (selectedMetric === "risk") {
      if (risk === "high") return "bg-red-500";
      if (risk === "medium") return "bg-yellow-500";
      return "bg-green-500";
    }

    // Color intensity based on value
    const intensity = maxValue > 0 ? value / maxValue : 0;
    if (intensity > 0.8) return "bg-blue-600";
    if (intensity > 0.6) return "bg-blue-500";
    if (intensity > 0.4) return "bg-blue-400";
    if (intensity > 0.2) return "bg-blue-300";
    return "bg-blue-200";
  };

  const formatValue = (value) => {
    if (selectedMetric === "duration") {
      return `${Math.round(value / 1000)}s`;
    }
    if (selectedMetric === "risk") {
      return `${Math.round(value)}%`;
    }
    return value.toString();
  };

  const formatLabel = (label, type) => {
    switch (type) {
      case "hourly":
        return `${label}:00`;
      case "daily":
        return new Date(label).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "weekly":
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][label];
      case "category":
        return label.charAt(0).toUpperCase() + label.slice(1);
      default:
        return label;
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Chart
            </h3>
            <p className="text-sm text-gray-600">
              {activities.length} activities in {timeRange}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Chart Type Selector */}
            <select
              value={selectedChartType}
              onChange={(e) => setSelectedChartType(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="hourly">Hourly Pattern</option>
              <option value="daily">Daily Trend</option>
              <option value="weekly">Weekly Pattern</option>
              <option value="category">By Category</option>
            </select>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="count">Activity Count</option>
              <option value="duration">Total Duration</option>
              <option value="risk">Risk Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Visualization */}
            <div
              className="flex items-end space-x-1 bg-gray-50 p-4 rounded-lg"
              style={{ height: "200px" }}
            >
              {chartData.map((dataPoint, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group cursor-pointer"
                  title={`${formatLabel(
                    dataPoint.label,
                    selectedChartType
                  )}: ${formatValue(dataPoint.value)}`}
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${getChartColor(
                      dataPoint.value,
                      dataPoint.risk
                    )} group-hover:opacity-80`}
                    style={{
                      height: `${
                        maxValue > 0 ? (dataPoint.value / maxValue) * 150 : 2
                      }px`,
                      minHeight: dataPoint.value > 0 ? "4px" : "2px",
                    }}
                  ></div>

                  {/* Label */}
                  <div className="text-xs text-gray-600 mt-2 text-center whitespace-nowrap overflow-hidden">
                    {formatLabel(dataPoint.label, selectedChartType)}
                  </div>

                  {/* Value on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -mt-8 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
                    {formatValue(dataPoint.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {chartData.reduce((sum, d) => sum + d.value, 0)}
                </div>
                <div className="text-sm text-blue-600">
                  Total{" "}
                  {selectedMetric === "count"
                    ? "Activities"
                    : selectedMetric === "duration"
                    ? "Duration"
                    : "Risk Score"}
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(
                    chartData.reduce((sum, d) => sum + d.value, 0) /
                      chartData.length
                  )}
                </div>
                <div className="text-sm text-green-600">Average</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">
                  {formatValue(maxValue)}
                </div>
                <div className="text-sm text-purple-600">Peak Value</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-semibold text-orange-600">
                  {chartData.filter((d) => d.value > 0).length}
                </div>
                <div className="text-sm text-orange-600">Active Periods</div>
              </div>
            </div>

            {/* Top Activities */}
            {selectedChartType === "category" && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Top Activity Categories
                </h4>
                <div className="space-y-2">
                  {chartData
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 capitalize">
                            {item.label.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatValue(item.value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for generating chart data
function generateHourlyData(activities, metric) {
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    label: hour,
    value: 0,
    activities: [],
    risk: "low",
  }));

  activities.forEach((activity) => {
    const hour = activity.timestamp.getHours();
    hourlyData[hour].activities.push(activity);

    switch (metric) {
      case "count":
        hourlyData[hour].value++;
        break;
      case "duration":
        hourlyData[hour].value += activity.duration || 0;
        break;
      case "risk":
        const riskValue =
          activity.risk === "high" ? 80 : activity.risk === "medium" ? 50 : 20;
        hourlyData[hour].value = Math.max(hourlyData[hour].value, riskValue);
        hourlyData[hour].risk = activity.risk;
        break;
    }
  });

  return hourlyData;
}

function generateDailyData(activities, metric, timeRange) {
  const days = parseInt(timeRange.replace("d", "")) || 7;
  const dailyData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayActivities = activities.filter(
      (activity) => activity.timestamp.toISOString().split("T")[0] === dateStr
    );

    let value = 0;
    switch (metric) {
      case "count":
        value = dayActivities.length;
        break;
      case "duration":
        value = dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
        break;
      case "risk":
        const riskValues = dayActivities.map((a) =>
          a.risk === "high" ? 80 : a.risk === "medium" ? 50 : 20
        );
        value = riskValues.length > 0 ? Math.max(...riskValues) : 0;
        break;
    }

    dailyData.push({
      label: dateStr,
      value,
      activities: dayActivities,
    });
  }

  return dailyData;
}

function generateWeeklyData(activities, metric) {
  const weeklyData = Array.from({ length: 7 }, (_, day) => ({
    label: day, // 0 = Sunday, 1 = Monday, etc.
    value: 0,
    activities: [],
  }));

  activities.forEach((activity) => {
    const dayOfWeek = activity.timestamp.getDay();
    weeklyData[dayOfWeek].activities.push(activity);

    switch (metric) {
      case "count":
        weeklyData[dayOfWeek].value++;
        break;
      case "duration":
        weeklyData[dayOfWeek].value += activity.duration || 0;
        break;
      case "risk":
        const riskValue =
          activity.risk === "high" ? 80 : activity.risk === "medium" ? 50 : 20;
        weeklyData[dayOfWeek].value = Math.max(
          weeklyData[dayOfWeek].value,
          riskValue
        );
        break;
    }
  });

  return weeklyData;
}

function generateCategoryData(activities, metric) {
  const categories = {};

  activities.forEach((activity) => {
    const category = activity.category || "other";
    if (!categories[category]) {
      categories[category] = {
        value: 0,
        activities: [],
        risk: "low",
      };
    }

    categories[category].activities.push(activity);

    switch (metric) {
      case "count":
        categories[category].value++;
        break;
      case "duration":
        categories[category].value += activity.duration || 0;
        break;
      case "risk":
        const riskValue =
          activity.risk === "high" ? 80 : activity.risk === "medium" ? 50 : 20;
        categories[category].value = Math.max(
          categories[category].value,
          riskValue
        );
        categories[category].risk =
          activity.risk === "high"
            ? "high"
            : activity.risk === "medium"
            ? "medium"
            : "low";
        break;
    }
  });

  return Object.entries(categories).map(([label, data]) => ({
    label,
    value: data.value,
    activities: data.activities,
    risk: data.risk,
  }));
}

const ActivityHeatmap = ({ activities, className = "" }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate heatmap data (7 days x 24 hours)
  const heatmapData = useMemo(() => {
    const data = {};
    const today = new Date();

    // Initialize 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      data[dateKey] = Array.from({ length: 24 }, () => 0);
    }

    // Fill with activity data
    activities.forEach((activity) => {
      const date = activity.timestamp.toISOString().split("T")[0];
      const hour = activity.timestamp.getHours();

      if (data[dateKey]) {
        data[dateKey][hour]++;
      }
    });

    return data;
  }, [activities]);

  const maxActivityCount = Math.max(...Object.values(heatmapData).flat());

  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-gray-100";
    const intensity = count / maxActivityCount;
    if (intensity > 0.8) return "bg-blue-600";
    if (intensity > 0.6) return "bg-blue-500";
    if (intensity > 0.4) return "bg-blue-400";
    if (intensity > 0.2) return "bg-blue-300";
    return "bg-blue-200";
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        Activity Heatmap
      </h4>

      <div className="space-y-1">
        {/* Hours header */}
        <div className="flex">
          <div className="w-16"></div>
          <div className="flex-1 grid grid-cols-24 gap-px">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="text-xs text-center text-gray-500">
                {hour % 6 === 0 ? hour : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap rows */}
        {Object.entries(heatmapData).map(([date, hourlyData]) => (
          <div key={date} className="flex items-center">
            <div className="w-16 text-xs text-gray-600 text-right pr-2">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex-1 grid grid-cols-24 gap-px">
              {hourlyData.map((count, hour) => (
                <div
                  key={hour}
                  className={`h-3 rounded-sm cursor-pointer ${getHeatmapColor(
                    count
                  )} transition-all duration-200 hover:scale-110`}
                  title={`${date} ${hour}:00 - ${count} activities`}
                  onClick={() => setSelectedDate({ date, hour, count })}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>Less activity</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
        </div>
        <span>More activity</span>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <strong>
              {selectedDate.date} at {selectedDate.hour}:00
            </strong>
          </div>
          <div className="text-sm text-gray-600">
            {selectedDate.count} activities recorded
          </div>
        </div>
      )}
    </div>
  );
};

// Export both components
export { ActivityHeatmap };
export default UserActivityChart;
