/**
 * ReportBuilder.js - Interactive report builder component
 * Drag-and-drop report creation with real-time preview
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  PhotoIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PlayIcon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateReport,
  useUpdateReport,
  useReportTemplates,
  useAvailableDataSources,
} from "../../hooks/useReports";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ReportBuilder = ({
  reportId = null, // null for new report, ID for editing
  onSave,
  onPreview,
  onCancel,
  className = "",
}) => {
  const [reportData, setReportData] = useState({
    name: "",
    description: "",
    type: "portfolio", // portfolio, trading, tax, custom
    template: "",
    layout: "vertical", // vertical, horizontal, grid
    components: [],
    filters: {},
    schedule: null,
    sharing: {
      isPublic: false,
      allowDownload: true,
      password: "",
    },
    format: {
      pageSize: "A4",
      orientation: "portrait",
      margins: "normal",
    },
  });

  const [activeComponent, setActiveComponent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState(null);

  // Available component types
  const componentTypes = [
    {
      id: "portfolio-summary",
      name: "Portfolio Summary",
      icon: ChartBarIcon,
      category: "portfolio",
      description: "Overview of portfolio performance",
      settings: ["dateRange", "currency", "benchmarks"],
    },
    {
      id: "performance-chart",
      name: "Performance Chart",
      icon: ChartBarIcon,
      category: "charts",
      description: "Line chart showing performance over time",
      settings: ["dateRange", "chartType", "comparison"],
    },
    {
      id: "holdings-table",
      name: "Holdings Table",
      icon: TableCellsIcon,
      category: "tables",
      description: "Detailed table of current holdings",
      settings: ["columns", "sorting", "grouping"],
    },
    {
      id: "trade-history",
      name: "Trade History",
      icon: TableCellsIcon,
      category: "tables",
      description: "List of executed trades",
      settings: ["dateRange", "columns", "filters"],
    },
    {
      id: "allocation-chart",
      name: "Asset Allocation",
      icon: ChartBarIcon,
      category: "charts",
      description: "Pie chart showing asset allocation",
      settings: ["groupBy", "chartType", "threshold"],
    },
    {
      id: "tax-summary",
      name: "Tax Summary",
      icon: DocumentTextIcon,
      category: "tax",
      description: "Tax-related calculations and summaries",
      settings: ["taxYear", "jurisdiction", "categories"],
    },
    {
      id: "text-block",
      name: "Text Block",
      icon: DocumentTextIcon,
      category: "content",
      description: "Custom text and formatting",
      settings: ["content", "style", "alignment"],
    },
    {
      id: "image-block",
      name: "Image",
      icon: PhotoIcon,
      category: "content",
      description: "Add images and logos",
      settings: ["source", "size", "alignment"],
    },
  ];

  // Hooks
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();
  const { data: templates } = useReportTemplates();
  const { data: dataSources } = useAvailableDataSources();

  // Component management
  const addComponent = (type) => {
    const newComponent = {
      id: `${type.id}-${Date.now()}`,
      type: type.id,
      name: type.name,
      settings: {},
      position: reportData.components.length,
      size: "full", // full, half, third, quarter
    };

    setReportData((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));

    setActiveComponent(newComponent.id);
  };

  const removeComponent = (componentId) => {
    setReportData((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
    }));

    if (activeComponent === componentId) {
      setActiveComponent(null);
    }
  };

  const updateComponent = (componentId, updates) => {
    setReportData((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === componentId ? { ...c, ...updates } : c
      ),
    }));
  };

  const duplicateComponent = (componentId) => {
    const component = reportData.components.find((c) => c.id === componentId);
    if (component) {
      const duplicate = {
        ...component,
        id: `${component.type}-${Date.now()}`,
        name: `${component.name} (Copy)`,
        position: component.position + 1,
      };

      setReportData((prev) => ({
        ...prev,
        components: [
          ...prev.components.slice(0, component.position + 1),
          duplicate,
          ...prev.components.slice(component.position + 1),
        ],
      }));
    }
  };

  // Drag and drop handling
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(reportData.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setReportData((prev) => ({
      ...prev,
      components: updatedItems,
    }));
  };

  // Save report
  const handleSave = async () => {
    try {
      let result;
      if (reportId) {
        result = await updateReportMutation.mutateAsync({
          id: reportId,
          updates: reportData,
        });
      } else {
        result = await createReportMutation.mutateAsync(reportData);
      }

      onSave?.(result);
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report");
    }
  };

  // Apply template
  const applyTemplate = (templateId) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      setReportData((prev) => ({
        ...prev,
        name: template.name,
        description: template.description,
        type: template.type,
        components: template.components || [],
        layout: template.layout || "vertical",
      }));
    }
  };

  // Component settings panel
  const renderComponentSettings = () => {
    const component = reportData.components.find(
      (c) => c.id === activeComponent
    );
    if (!component) return null;

    const componentType = componentTypes.find((t) => t.id === component.type);

    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Component Settings
          </h3>
          <button
            onClick={() => setActiveComponent(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Component Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Component Name
            </label>
            <input
              type="text"
              value={component.name}
              onChange={(e) =>
                updateComponent(component.id, { name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Component Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["full", "half", "third", "quarter"].map((size) => (
                <button
                  key={size}
                  onClick={() => updateComponent(component.id, { size })}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    component.size === size
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Component-specific settings */}
          {componentType?.settings?.includes("dateRange") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={component.settings?.dateRange || "ytd"}
                onChange={(e) =>
                  updateComponent(component.id, {
                    settings: {
                      ...component.settings,
                      dateRange: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="ytd">Year to Date</option>
                <option value="1y">1 Year</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          )}

          {componentType?.settings?.includes("chartType") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={component.settings?.chartType || "line"}
                onChange={(e) =>
                  updateComponent(component.id, {
                    settings: {
                      ...component.settings,
                      chartType: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
          )}

          {componentType?.settings?.includes("columns") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Columns
              </label>
              <div className="space-y-2">
                {[
                  "symbol",
                  "name",
                  "quantity",
                  "price",
                  "value",
                  "change",
                  "weight",
                ].map((col) => (
                  <label key={col} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        component.settings?.columns?.includes(col) ?? true
                      }
                      onChange={(e) => {
                        const currentColumns =
                          component.settings?.columns || [];
                        const newColumns = e.target.checked
                          ? [...currentColumns, col]
                          : currentColumns.filter((c) => c !== col);

                        updateComponent(component.id, {
                          settings: {
                            ...component.settings,
                            columns: newColumns,
                          },
                        });
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {col.replace(/([A-Z])/g, " $1")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => duplicateComponent(component.id)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => removeComponent(component.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex bg-gray-50 ${className}`}>
      {/* Left Sidebar - Component Library */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Report Builder
          </h2>

          {/* Report Info */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Report name..."
              value={reportData.name}
              onChange={(e) =>
                setReportData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <textarea
              placeholder="Report description..."
              value={reportData.description}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />

            {/* Report Type */}
            <select
              value={reportData.type}
              onChange={(e) =>
                setReportData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="portfolio">Portfolio Report</option>
              <option value="trading">Trading Report</option>
              <option value="tax">Tax Report</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>
        </div>

        {/* Templates */}
        {templates && templates.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Templates
            </h3>
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Component Library */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Components</h3>

          {/* Component Categories */}
          {["portfolio", "charts", "tables", "content", "tax"].map(
            (category) => {
              const categoryComponents = componentTypes.filter(
                (c) => c.category === category
              );
              if (categoryComponents.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryComponents.map((component) => (
                      <div
                        key={component.id}
                        onClick={() => addComponent(component)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <component.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {component.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {component.description}
                            </div>
                          </div>
                          <PlusIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {reportData.name || "Untitled Report"}
              </h1>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {reportData.components.length} components
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Layout Options */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {["vertical", "horizontal", "grid"].map((layout) => (
                  <button
                    key={layout}
                    onClick={() =>
                      setReportData((prev) => ({ ...prev, layout }))
                    }
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      reportData.layout === layout
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {showPreview ? "Edit" : "Preview"}
              </button>

              <button
                onClick={handleSave}
                disabled={
                  createReportMutation.isLoading ||
                  updateReportMutation.isLoading
                }
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {createReportMutation.isLoading ||
                updateReportMutation.isLoading
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          {showPreview ? (
            /* Preview Mode */
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl mx-auto shadow-sm">
              <div className="space-y-8">
                {reportData.components.map((component, index) => (
                  <div
                    key={component.id}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        {component.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {component.type}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-8 text-center text-gray-500">
                      Component Preview: {component.name}
                      <br />
                      <span className="text-xs">
                        Settings: {JSON.stringify(component.settings)}
                      </span>
                    </div>
                  </div>
                ))}

                {reportData.components.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No components added yet</p>
                    <p className="text-sm">
                      Switch to edit mode to add components
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="report-components">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 max-w-4xl mx-auto"
                  >
                    {reportData.components.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white rounded-lg border-2 transition-all ${
                              activeComponent === component.id
                                ? "border-blue-500 shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              snapshot.isDragging ? "shadow-xl scale-105" : ""
                            }`}
                          >
                            {/* Component Header */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 cursor-move"
                              onClick={() => setActiveComponent(component.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-8 bg-gray-300 rounded"></div>
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {component.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {
                                      componentTypes.find(
                                        (t) => t.id === component.type
                                      )?.description
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  {component.size}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveComponent(component.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                  title="Settings"
                                >
                                  <Cog6ToothIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeComponent(component.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Component Content */}
                            <div className="p-6">
                              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                                <div className="text-lg font-medium mb-2">
                                  {component.name}
                                </div>
                                <div className="text-sm">
                                  Component Type: {component.type}
                                </div>
                                {Object.keys(component.settings).length > 0 && (
                                  <div className="text-xs mt-2 text-gray-400">
                                    {Object.entries(component.settings).map(
                                      ([key, value]) => (
                                        <div key={key}>
                                          {key}: {JSON.stringify(value)}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {/* Empty State */}
                    {reportData.components.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Start building your report
                        </h3>
                        <p className="mb-4">
                          Drag components from the left panel to create your
                          report
                        </p>
                        <div className="text-sm text-gray-400">
                          <p>
                            • Choose from portfolio, trading, and tax components
                          </p>
                          <p>
                            • Customize each component with specific settings
                          </p>
                          <p>• Rearrange components by dragging</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Right Sidebar - Component Settings */}
      {activeComponent && !showPreview && renderComponentSettings()}
    </div>
  );
};

export default ReportBuilder;
