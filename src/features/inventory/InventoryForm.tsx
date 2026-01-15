// =============================================================================
// INVENTORY INPUT FORM COMPONENT
// =============================================================================
// Form for adding new inventory items with validation and autocomplete

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import { databaseService } from '../../services/index';
import { InventoryItem as ApiInventoryItem } from '../../services/api-client';
import { InventoryItem, InventoryFormData, UserData } from '../../shared/types/database';
import './InventoryForm.css';

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface InventoryFormProps {
  onItemAdded?: (item: InventoryItem) => void;
  onViewInventory?: () => void;
  currentUser?: UserData;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const InventoryForm: React.FC<InventoryFormProps> = ({
  onItemAdded,
  onViewInventory,
  currentUser
}) => {
  const { currentTheme } = useTheme();
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const partNumberInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<InventoryFormData>({
    part_number: '',
    quantity: '1',
    item_type: '',
    description: '',
    systems: '',
    case_code_in: '',
    size: '',
    link: '',
    company: '',
    notes: '',
    category: ''  // Start empty for manual entry
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Barcode scanner event listener
  useEffect(() => {
    const handleBarcodeScanned = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const scannedCode = customEvent.detail;
      
      console.log('Barcode scanned:', scannedCode);
      
      // Update form data with scanned code
      setFormData(prev => ({
        ...prev,
        part_number: scannedCode
      }));
      
      // Trigger autocomplete since we have a new value
      if (scannedCode.length > 1) {
        fetchAutocompleteSuggestions(scannedCode);
      }
      
      // Focus the input
      setTimeout(() => {
        partNumberInputRef.current?.focus();
      }, 100);
    };

    window.addEventListener('barcode-scanned', handleBarcodeScanned);
    return () => window.removeEventListener('barcode-scanned', handleBarcodeScanned);
  }, []);

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================
  const handleInputChange = (field: keyof InventoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Trigger autocomplete for part number
    if (field === 'part_number' && value.length > 1) {
      fetchAutocompleteSuggestions(value);
    } else if (field === 'part_number') {
      setShowSuggestions(false);
    }
  };

  const fetchAutocompleteSuggestions = async (input: string) => {
    try {
      const suggestions = await databaseService.getAutocompleteSuggestions(input, '8');
      setAutocompleteSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.warn('Failed to fetch autocomplete suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, part_number: suggestion }));
    setShowSuggestions(false);
  };

  const clearForm = () => {
    setFormData({
      part_number: '',
      quantity: '1',
      item_type: '',
      description: '',
      systems: '',
      case_code_in: '',
      size: '',
      link: '',
      company: '',
      notes: '',
      category: ''  // Reset to empty
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number.trim()) {
      setStatusMessage({ type: 'error', message: 'Part Number is required!' });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity)) {
      setStatusMessage({ type: 'error', message: 'Quantity must be a valid number!' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const item: ApiInventoryItem = {
        part_number: formData.part_number.trim(),
        quantity: quantity,
        item_type: formData.item_type.trim() || undefined,
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || undefined,
        company: formData.company.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        systems: formData.systems.trim() || undefined,
        case_code_in: formData.case_code_in.trim() || undefined,
        size: formData.size.trim() || undefined,
        link: formData.link.trim() || undefined,
        created_by: currentUser?.username
      };

      await databaseService.addInventoryItem(item);
      
      setStatusMessage({ 
        type: 'success', 
        message: `✅ Item "${item.part_number}" added successfully!` 
      });
      
      clearForm();
      onItemAdded?.(item);
      
    } catch (error) {
      console.error('Failed to add item:', error);
      setStatusMessage({ 
        type: 'error', 
        message: `❌ Failed to add item: ${error}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div 
      className="inventory-form-container"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
        boxShadow: `0 4px 12px ${currentTheme.colors.shadow}`
      }}
    >
      {/* Header */}
      <div className="form-header">
        <h2 style={{ color: currentTheme.colors.onSurface }}>
          Add New Inventory Item
        </h2>
        <p style={{ color: currentTheme.colors.disabled }}>
          Enter the details for the electrical component
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div 
          className={`status-message ${statusMessage.type}`}
          style={{
            backgroundColor: statusMessage.type === 'success' 
              ? currentTheme.colors.success 
              : currentTheme.colors.error,
            color: currentTheme.colors.onPrimary
          }}
        >
          {statusMessage.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="inventory-form">
        <div className="form-grid">
          {/* Part Number - Required */}
          <div className="form-field required">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Part Number *
            </label>
            <div className="autocomplete-container">
              <input
                ref={partNumberInputRef}
                type="text"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number..."
                required
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.onBackground
                }}
              />
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <div 
                  className="autocomplete-dropdown"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    boxShadow: `0 4px 8px ${currentTheme.colors.shadow}`
                  }}
                >
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="autocomplete-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{ color: currentTheme.colors.onSurface }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity - Required */}
          <div className="form-field required">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="1"
              required
              min="-99999"
              max="99999"
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Category */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g. Capacitors, Resistors, Bearings..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Item Type */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Item Type
            </label>
            <input
              type="text"
              value={formData.item_type}
              onChange={(e) => handleInputChange('item_type', e.target.value)}
              placeholder="e.g., Capacitor, Resistor..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Description */}
          <div className="form-field half-width">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="10KΩ, 10uF..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Systems */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Systems
            </label>
            <input
              type="text"
              value={formData.systems}
              onChange={(e) => handleInputChange('systems', e.target.value)}
              placeholder="Related systems..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Case Code */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Case Code In
            </label>
            <input
              type="text"
              value={formData.case_code_in}
              onChange={(e) => handleInputChange('case_code_in', e.target.value)}
              placeholder="Case code..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Size */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Size
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
              placeholder="Physical size..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Company */}
          <div className="form-field">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Company/Manufacturer..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Link */}
          <div className="form-field full-width">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Link
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
              placeholder="Reference URL..."
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>

          {/* Notes */}
          <div className="form-field full-width">
            <label style={{ color: currentTheme.colors.onSurface }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={1}
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.onBackground
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="add-button"
            style={{
              backgroundColor: currentTheme.colors.success,
              color: currentTheme.colors.onPrimary
            }}
          >
            {isSubmitting ? '⏳ Adding...' : '➕ Add Item'}
          </button>
          
          <button
            type="button"
            onClick={clearForm}
            className="clear-button"
            style={{
              backgroundColor: 'transparent',
              color: currentTheme.colors.disabled,
              borderColor: currentTheme.colors.border
            }}
          >
            🗑️ Clear Form
          </button>
        </div>
      </form>

      {/* View Inventory Button */}
      <div className="view-inventory-section">
        <button
          onClick={onViewInventory}
          className="view-inventory-button"
          style={{
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.onPrimary
          }}
        >
          📋 View Inventory Table
        </button>
      </div>
    </div>
  );
};

export default InventoryForm;
