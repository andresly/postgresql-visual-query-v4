import React, { useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * Component that manages DnD context for compatibility with multiple
 * drag and drop libraries (react-dnd and react-grid-layout)
 */
interface DndIntegrationProps {
  children: React.ReactNode;
}

const DndIntegration: React.FC<DndIntegrationProps> = ({ children }) => {
  const dndRef = useRef<HTMLDivElement>(null);

  // Prevent event propagation conflicts between libraries
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      // Allow react-grid-layout to handle its own drag events
      // by checking if the drag started from the drag handle
      const target = e.target as HTMLElement;
      if (target && target.closest('.table-drag-handle')) {
        // This is a react-grid-layout drag, don't interfere
        return;
      }

      // For other elements that might need react-dnd
      if (target && !target.closest('.react-grid-item')) {
        // Let react-dnd handle it
      }
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={dndRef} className="dnd-integration-wrapper">
        {children}
      </div>
    </DndProvider>
  );
};

export default DndIntegration;
