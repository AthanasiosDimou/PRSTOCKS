// Database Management Page - Database export and auto-creation info  
import React from 'react';
import DatabaseExport from '../../features/file-management/DatabaseExport';
import { DATABASE_TYPE } from '@/services';
import './DatabaseManagementPage.css';

const DatabaseManagementPage: React.FC = () => {
  return (
    <div className="database-management-page">
      <div className="page-header">
        <h1>🗄️ Database Management</h1>
        <p className="page-description">
          Manage your database storage, migrate to portable SQLite files, and export your data.
        </p>
        <div className="current-config">
          <strong>Current Database Type:</strong> <span className="db-type">{DATABASE_TYPE.SQLITE.toUpperCase()}</span>
        </div>
      </div>

      <div className="management-sections">
        {/* Auto-Creation Info Section */}
        <section className="management-section">
          <h3>🔄 SQLAlchemy-like Database Auto-Creation</h3>
          <div className="auto-creation-info">
            <p>✅ Databases are automatically created from SQL schemas when the app starts</p>
            <p>🏗️ No manual migration needed - just like SQLAlchemy's <code>create_all()</code></p>
            <p>📁 Admin category is already included in the system</p>
          </div>
        </section>

        {/* Export Section */}
        <section className="management-section">
          <DatabaseExport />
        </section>

        {/* Information Section */}
        <section className="management-section info-section">
          <h3>📚 About Database Types</h3>
          
          <div className="db-comparison">
            <div className="db-type-info">
              <h4>🌐 IndexedDB (Browser Storage)</h4>
              <ul>
                <li>✅ Built into browsers</li>
                <li>❌ Data tied to browser/device</li>
                <li>❌ Cannot export or copy files</li>
                <li>❌ Limited portability</li>
              </ul>
            </div>
            
            <div className="db-type-info">
              <h4>📄 JSON Files</h4>
              <ul>
                <li>✅ Human-readable format</li>
                <li>✅ Can be copied between devices</li>
                <li>❌ Not a proper database</li>
                <li>❌ No database tools support</li>
              </ul>
            </div>
            
            <div className="db-type-info recommended">
              <h4>💾 SQLite Database Files (.db)</h4>
              <ul>
                <li>✅ Actual database files</li>
                <li>✅ Can be copied between devices</li>
                <li>✅ Works with database tools</li>
                <li>✅ Proper SQL schemas</li>
                <li>✅ Best portability</li>
              </ul>
              <div className="recommended-badge">🏆 Recommended</div>
            </div>
          </div>

          <div className="tools-info">
            <h4>🛠️ Compatible Tools for SQLite Files</h4>
            <div className="tools-list">
              <div className="tool">
                <strong>DB Browser for SQLite</strong> - Free GUI tool for viewing/editing SQLite files
              </div>
              <div className="tool">
                <strong>DBeaver</strong> - Universal database tool with SQLite support
              </div>
              <div className="tool">
                <strong>SQLiteStudio</strong> - Lightweight SQLite database manager
              </div>
              <div className="tool">
                <strong>Command Line</strong> - Use `sqlite3` command for scripting
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DatabaseManagementPage;