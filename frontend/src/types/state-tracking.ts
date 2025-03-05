/**
 * State tracking types for entity changes across the application
 */

/**
 * Enum defining possible change states for an entity
 */
export enum ChangeState {
  UNCHANGED = 'unchanged',
  INSERTED = 'inserted',
  UPDATED = 'updated',
  DELETED = 'deleted'
}

/**
 * Interface for entities that can track their change state
 */
export interface Trackable {
  changeState?: ChangeState;
  hasUnsavedChanges?: boolean;
}

/**
 * Type to add tracking capability to any entity
 */
export type TrackableEntity<T> = T & Trackable;

/**
 * Interface for API payload when saving changes
 */
export interface ChangePayload<T> {
  data: T;
  changeState: ChangeState;
}

/**
 * Interface for managing state changes
 */
export interface StateManager<T extends Trackable> {
  items: T[];
  deletedItems: T[];
  markAsInserted: (item: T) => T;
  markAsUpdated: (item: T) => T;
  markAsDeleted: (item: T) => void;
  resetTracking: () => void;
  getChangedItems: () => T[];
  getChangePayload: () => any[];
} 