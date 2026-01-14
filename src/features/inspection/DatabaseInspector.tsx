// =============================================================================
// DATABASE INSPECTOR COMPONENT
// =============================================================================
// Excel-like database view and editing interface for inventory inspection

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import { databaseService } from '../../services/index';
import { InventoryItem } from '@/services';
import './DatabaseInspector.css';

interface DatabaseInspectorProps {
  onBackToMain?: () => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({ onBackToMain }) => {
  const { currentTheme } = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'asc' | 'desc' } | null>(null);

  // Column definitions for the database inspector
  const columns: { key: keyof InventoryItem; label: string; editable: boolean }[] = [
  { key: 'item_id', label: 'ID', editable: false },
  { key: 'part_number', label: 'Part Number', editable: true },
  { key: 'quantity', label: 'Quantity', editable: true },
  { key: 'category', label: 'Category', editable: true },
  { key: 'item_type', label: 'Item Type', editable: true },
  { key: 'description', label: 'Description', editable: true },
  { key: 'systems', label: 'Systems', editable: true },
  { key: 'case_code_in', label: 'Case Code', editable: true },
  { key: 'size', label: 'Size', editable: true },
  { key: 'company', label: 'Company', editable: true },
  { key: 'link', label: 'Link', editable: true },
  { key: 'notes', label: 'Notes', editable: true },
  { key: 'date_time_added', label: 'Date Added', editable: false },
  ];

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseService.getAllInventoryItems();
      setItems(data);
    } catch (err) {
      setError('Failed to load database records');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort items
  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortConfig]);

  // Handle sorting
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle cell editing
  const handleCellEdit = async (rowIndex: number, columnKey: keyof InventoryItem, newValue: string) => {
    const item = sortedItems[rowIndex];
    if (!item || !item.item_id) return;

    try {
      // Convert value if needed
      let processedValue: any = newValue;
      if (columnKey === 'quantity') {
        processedValue = parseInt(newValue) || 0;
      }

      await databaseService.updateInventoryItemField(item.item_id, columnKey, processedValue);
      
      // Update local state
      setItems(prev => prev.map(i => 
        i.item_id === item.item_id 
          ? { ...i, [columnKey]: processedValue }
          : i
      ));
      
      setEditingCell(null);
    } catch (err) {
      console.error('Error updating cell:', err);
      setError('Failed to update cell');
    }
  };

  // Handle cell click
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const column = columns[colIndex];
    if (column.editable) {
      setEditingCell({ row: rowIndex, col: colIndex });
    }
  };

  // Handle delete row
  const handleDeleteRow = async (item: InventoryItem) => {
    if (!item.item_id) return;
    
    if (window.confirm(`Are you sure you want to delete ${item.part_number}?`)) {
      try {
        await databaseService.deleteInventoryItem(item.item_id);
        setItems(prev => prev.filter(i => i.item_id !== item.item_id));
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div className="database-inspector" style={{ color: currentTheme.colors.onBackground }}>
        <div className="loading">Loading database...</div>
      </div>
    );
  }

  return (
    <div 
      className="database-inspector"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.onBackground 
      }}
    >
      {/* Header */}
      <div 
        className="inspector-header"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderBottomColor: currentTheme.colors.border 
        }}
      >
        <div className="header-controls">
          <button
            onClick={onBackToMain}
            className="back-button"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              color: currentTheme.colors.onBackground
            }}
          >
            ← Back to Main
          </button>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onSurface
              }}
            />
          </div>

          <button
            onClick={loadData}
            className="refresh-button"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.onPrimary
            }}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="inspector-title">
          <h1>🔍 Database Inspector</h1>
          <p>Excel-like interface for viewing and editing inventory data</p>
          <span className="record-count">{sortedItems.length} records</span>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ backgroundColor: currentTheme.colors.error }}>
          {error}
        </div>
      )}

      {/* Excel-like Table */}
      <div className="table-container">
        <table 
          className="excel-table"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}
        >
          <thead>
            <tr style={{ backgroundColor: currentTheme.colors.primary }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`sortable-header ${sortConfig?.key === column.key ? 'sorted' : ''}`}
                  style={{ 
                    color: currentTheme.colors.onPrimary,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  {column.label}
                  {sortConfig?.key === column.key && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
              <th style={{ color: currentTheme.colors.onPrimary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, rowIndex) => (
              <tr 
                key={item.item_id}
                className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}
                style={{ 
                  backgroundColor: rowIndex % 2 === 0 
                    ? currentTheme.colors.surface 
                    : currentTheme.colors.background 
                }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`cell ${column.editable ? 'editable' : 'readonly'} ${
                      editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'editing' : ''
                    }`}
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <input
                        type={column.key === 'quantity' ? 'number' : 'text'}
                        defaultValue={item[column.key]?.toString() || ''}
                        onBlur={(e) => handleCellEdit(rowIndex, column.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(rowIndex, column.key, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        autoFocus
                        className="cell-input"
                        style={{
                          backgroundColor: currentTheme.colors.surface,
                          color: currentTheme.colors.onSurface,
                          borderColor: currentTheme.colors.primary
                        }}
                      />
                    ) : (
                      <span>{item[column.key]?.toString() || ''}</span>
                    )}
                  </td>
                ))}
                <td style={{ borderColor: currentTheme.colors.border }}>
                  <button
                    onClick={() => handleDeleteRow(item)}
                    className="delete-button"
                    style={{
                      backgroundColor: currentTheme.colors.error,
                      color: currentTheme.colors.onBackground
                    }}
                    title="Delete this row"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedItems.length === 0 && !loading && (
        <div className="empty-state" style={{ color: currentTheme.colors.disabled }}>
          No records found. Try adjusting your search or add some inventory items.
        </div>
      )}
    </div>
  );
};

export default DatabaseInspector;
