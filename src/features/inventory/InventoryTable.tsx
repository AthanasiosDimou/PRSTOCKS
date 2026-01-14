// =============================================================================
// INVENTORY TABLE COMPONENT
// =============================================================================
// Table view for displaying and managing inventory items

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import { databaseService } from '../../services/index';
import { InventoryItem } from '../../shared/types/database';
import { DualDatabasePreferencesService } from '../../shared/services/DualDatabasePreferencesService';
import './InventoryTable.css';

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface InventoryTableProps {
  onBackToInput?: () => void;
  refreshTrigger?: number; // Used to trigger refreshes from parent
}

// =============================================================================
// COLUMN CONFIGURATION INTERFACE
// =============================================================================
interface ColumnConfig {
  key: keyof InventoryItem;
  label: string;
  visible: boolean;
  width?: number;
  resizable: boolean;
}

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'item_id', label: 'ID', visible: true, width: 80, resizable: true },
  { key: 'item_type', label: 'Type', visible: true, width: 120, resizable: true },
  { key: 'description', label: 'Description', visible: true, width: 200, resizable: true },
  { key: 'category', label: 'Category', visible: true, width: 120, resizable: true },
  { key: 'part_number', label: 'Part Number', visible: true, width: 150, resizable: true },
  { key: 'quantity', label: 'Quantity', visible: true, width: 100, resizable: true },
  { key: 'systems', label: 'Systems', visible: true, width: 150, resizable: true },
  { key: 'date_time_added', label: 'Date Added', visible: true, width: 140, resizable: true },
  { key: 'case_code_in', label: 'Case Code', visible: true, width: 120, resizable: true },
  { key: 'size', label: 'Size', visible: true, width: 100, resizable: true },
  { key: 'company', label: 'Company', visible: true, width: 120, resizable: true },
  { key: 'link', label: 'Link', visible: false, width: 100, resizable: true },
  { key: 'notes', label: 'Notes', visible: false, width: 200, resizable: true }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const InventoryTable: React.FC<InventoryTableProps> = ({
  onBackToInput,
  refreshTrigger
}) => {
  const { currentTheme } = useTheme();
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<keyof InventoryItem>('date_time_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingCell, setEditingCell] = useState<{rowId: number, field: keyof InventoryItem} | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Column management state
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  // =============================================================================
  // DATA LOADING
  // =============================================================================
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const allItems = await databaseService.getAllInventoryItems();
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // COLUMN MANAGEMENT
  // =============================================================================
  const handleColumnDragStart = (e: React.DragEvent, columnIndex: number) => {
    setDraggedColumn(columnIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for Firefox
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedColumn === null || draggedColumn === dropIndex) {
      setDraggedColumn(null);
      return;
    }

    const newColumns = [...columns];
    const draggedItem = newColumns[draggedColumn];
    
    // Remove dragged item and insert at new position
    newColumns.splice(draggedColumn, 1);
    newColumns.splice(dropIndex, 0, draggedItem);
    
    setColumns(newColumns);
    setDraggedColumn(null);
    
    // Save column order to user preferences
    saveColumnPreferences(newColumns);
  };

  const handleColumnResize = (columnIndex: number, newWidth: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].width = Math.max(50, newWidth); // Minimum width of 50px
    setColumns(newColumns);
    
    // Save column widths to user preferences
    saveColumnPreferences(newColumns);
  };

  const toggleColumnVisibility = (columnKey: keyof InventoryItem) => {
    const newColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    setColumns(newColumns);
    
    // Save column visibility to user preferences
    saveColumnPreferences(newColumns);
  };

  const saveColumnPreferences = async (_columnConfig: ColumnConfig[]) => {
    try {
      const currentUser = 'Nassos'; // TODO: Get from auth context
      await DualDatabasePreferencesService.updateDeviceTheme('columns', currentUser); // TODO: Create separate method for column prefs
      console.log('📊 Column preferences saved successfully');
    } catch (error) {
      console.error('📊 Failed to save column preferences:', error);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowColumnMenu(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColumnMenu(false);
      setContextMenuPosition(null);
    };
    
    if (showColumnMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColumnMenu]);

  // Handle column resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn !== null) {
        const deltaX = e.clientX - resizeStartX;
        const newWidth = resizeStartWidth + deltaX;
        handleColumnResize(resizingColumn, newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  // =============================================================================
  // SEARCH AND FILTER
  // =============================================================================
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        (item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.item_type && item.item_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // =============================================================================
  // SORTING
  // =============================================================================
  const handleSort = (field: keyof InventoryItem) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...filteredItems].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return newDirection === 'asc' ? 1 : -1;
      if (bVal === undefined) return newDirection === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return newDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setFilteredItems(sorted);
  };

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  const handleSelectItem = (itemId: number | undefined) => {
    if (!itemId) return;
    
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredItems.map(item => item.item_id).filter(Boolean) as number[]);
      setSelectedItems(allIds);
    }
  };

  // =============================================================================
  // EDITING
  // =============================================================================
  const handleCellEdit = (itemId: number | undefined, field: keyof InventoryItem, currentValue: any) => {
    if (!itemId || field === 'item_id' || field === 'date_time_added') return;
    
    setEditingCell({ rowId: itemId, field });
    setEditValue(String(currentValue || ''));
  };

  const handleEditSave = async () => {
    if (!editingCell) return;

    try {
      const success = await databaseService.updateInventoryItemField(
        editingCell.rowId,
        editingCell.field,
        editValue
      );

      if (success) {
        // Update local state
        setItems(prevItems =>
          prevItems.map(item =>
            item.item_id === editingCell.rowId
              ? { ...item, [editingCell.field]: editValue || undefined }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // =============================================================================
  // DELETE OPERATIONS
  // =============================================================================
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.size} selected item(s)?`
    );

    if (!confirmed) return;

    try {
      for (const itemId of selectedItems) {
        await databaseService.deleteInventoryItem(itemId);
      }
      
      // Reload data
      await loadItems();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  const handleDeleteItem = async (itemId: number | undefined) => {
    if (!itemId) return;

    const item = items.find(i => i.item_id === itemId);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item?.part_number}"?`
    );

    if (!confirmed) return;

    try {
      await databaseService.deleteInventoryItem(itemId);
      await loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  const getSortIcon = (field: keyof InventoryItem) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderCell = (item: InventoryItem, field: keyof InventoryItem) => {
    const value = item[field];
    const isEditing = editingCell?.rowId === item.item_id && editingCell?.field === field;
    const isEditable = field !== 'item_id' && field !== 'date_time_added';

    if (isEditing) {
      return (
        <div className="edit-cell">
          {field === 'quantity' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
              autoFocus
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.onBackground,
                border: `1px solid ${currentTheme.colors.primary}`
              }}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
              autoFocus
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.onBackground,
                border: `1px solid ${currentTheme.colors.primary}`
              }}
            />
          )}
        </div>
      );
    }

    const displayValue = field === 'date_time_added' 
      ? formatDate(value as string)
      : value || '';

    return (
      <div
        className={isEditable ? 'editable-cell' : ''}
        onClick={() => isEditable && handleCellEdit(item.item_id ?? undefined, field, value)}
        title={isEditable ? 'Click to edit' : ''}
      >
        {String(displayValue)}
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  if (loading) {
    return (
      <div className="loading-container" style={{ color: currentTheme.colors.onBackground }}>
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{ color: currentTheme.colors.error }}>
        <p>❌ {error}</p>
        <button onClick={loadItems} style={{ color: currentTheme.colors.primary }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div 
      className="inventory-table-container"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }}
    >
      {/* Header */}
      <div className="table-header">
        <div className="header-left">
          <button
            onClick={onBackToInput}
            className="back-button"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              color: currentTheme.colors.onPrimary
            }}
          >
            ← Back to Input
          </button>
        </div>

        <div className="header-center">
          <h2 style={{ color: currentTheme.colors.onSurface }}>
            📋 Inventory Database
          </h2>
          <p style={{ color: currentTheme.colors.disabled }}>
            {filteredItems.length} of {items.length} items
          </p>
        </div>

        <div className="header-right">
          <button
            onClick={loadItems}
            className="refresh-button"
            style={{
              backgroundColor: currentTheme.colors.info,
              color: currentTheme.colors.onPrimary
            }}
          >
            🔄 Refresh
          </button>
          
          {selectedItems.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="delete-button"
              style={{
                backgroundColor: currentTheme.colors.error,
                color: currentTheme.colors.onPrimary
              }}
            >
              🗑️ Delete Selected ({selectedItems.size})
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by part number, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.onBackground
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper" onContextMenu={handleRightClick}>
        <table 
          className="inventory-table"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <thead>
            <tr style={{ backgroundColor: currentTheme.colors.surfaceVariant }}>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {columns
                .filter(col => col.visible)
                .map((column, index) => (
                <th
                  key={column.key}
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, index)}
                  onDragOver={handleColumnDragOver}
                  onDrop={(e) => handleColumnDrop(e, index)}
                  onClick={() => handleSort(column.key)}
                  className="sortable-header draggable-header"
                  style={{ 
                    color: currentTheme.colors.onSurface,
                    width: column.width,
                    minWidth: column.width,
                    position: 'relative',
                    cursor: 'grab'
                  }}
                >
                  <div className="column-content">
                    <span>{column.label} {getSortIcon(column.key)}</span>
                    {column.resizable && (
                      <div 
                        className="resize-handle"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingColumn(index);
                          setResizeStartX(e.clientX);
                          setResizeStartWidth(column.width || 100);
                        }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          cursor: 'col-resize',
                          backgroundColor: resizingColumn === index ? currentTheme.colors.primary : 'transparent'
                        }}
                      />
                    )}
                  </div>
                </th>
              ))}
              <th style={{ color: currentTheme.colors.onSurface }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr
                key={item.item_id || index}
                className={selectedItems.has(item.item_id!) ? 'selected' : ''}
                style={{
                  backgroundColor: index % 2 === 0 
                    ? currentTheme.colors.background 
                    : currentTheme.colors.surface
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.item_id!)}
                    onChange={() => handleSelectItem(item.item_id ?? undefined)}
                  />
                </td>
                {columns
                  .filter(col => col.visible)
                  .map((column) => (
                    <td 
                      key={column.key}
                      style={{ 
                        color: currentTheme.colors.onBackground,
                        width: column.width,
                        minWidth: column.width
                      }}
                    >
                      {renderCell(item, column.key)}
                    </td>
                  ))}
                <td>
                  <button
                    onClick={() => handleDeleteItem(item.item_id ?? undefined)}
                    className="delete-row-button"
                    style={{
                      backgroundColor: currentTheme.colors.error,
                      color: currentTheme.colors.onPrimary
                    }}
                    title="Delete this item"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Column Visibility Context Menu */}
      {showColumnMenu && contextMenuPosition && (
        <div
          className="column-context-menu"
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '8px',
            minWidth: '200px'
          }}
        >
          <div style={{ 
            color: currentTheme.colors.onSurface, 
            fontWeight: 'bold', 
            marginBottom: '8px',
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            paddingBottom: '8px'
          }}>
            Column Visibility
          </div>
          {columns.map((column) => (
            <div
              key={column.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 0',
                cursor: 'pointer',
                color: currentTheme.colors.onSurface
              }}
              onClick={() => toggleColumnVisibility(column.key)}
            >
              <input
                type="checkbox"
                checked={column.visible}
                onChange={() => {}} // Handled by onClick above
                style={{ marginRight: '8px' }}
              />
              <span>{column.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
