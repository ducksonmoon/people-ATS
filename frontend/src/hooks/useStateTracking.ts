import { useState, useCallback } from "react";
import {
  ChangeState,
  Trackable,
  TrackableEntity,
} from "../types/state-tracking";

/**
 * Hook for managing trackable entity state changes
 * @param initialItems Initial array of items
 * @returns Functions and state for tracking changes
 */
export function useStateTracking<T extends object>(initialItems: T[] = []) {
  // Initialize with trackable entities
  const trackableInitialItems = initialItems.map(
    (item) =>
      ({
        ...item,
        changeState: ChangeState.UNCHANGED,
        hasUnsavedChanges: false,
      } as TrackableEntity<T>)
  );

  const [items, setItems] = useState<TrackableEntity<T>[]>(
    trackableInitialItems
  );
  const [deletedItems, setDeletedItems] = useState<TrackableEntity<T>[]>([]);

  /**
   * Set new items and mark them all as unchanged
   */
  const setAllItems = useCallback((newItems: T[]) => {
    const trackableItems = newItems.map(
      (item) =>
        ({
          ...item,
          changeState: ChangeState.UNCHANGED,
          hasUnsavedChanges: false,
        } as TrackableEntity<T>)
    );

    setItems(trackableItems);
    setDeletedItems([]);
  }, []);

  /**
   * Mark an item as inserted
   */
  const markAsInserted = useCallback((item: T): TrackableEntity<T> => {
    const trackableItem = {
      ...item,
      changeState: ChangeState.INSERTED,
      hasUnsavedChanges: true,
    } as TrackableEntity<T>;

    setItems((prev) => [...prev, trackableItem]);
    return trackableItem;
  }, []);

  /**
   * Mark an item as updated
   */
  const markAsUpdated = useCallback(
    (updatedItem: T, identifier: (item: T) => boolean): TrackableEntity<T> => {
      const trackableItem = {
        ...updatedItem,
        changeState: ChangeState.UPDATED,
        hasUnsavedChanges: true,
      } as TrackableEntity<T>;

      setItems((prev) =>
        prev.map((item) => (identifier(item as T) ? trackableItem : item))
      );

      return trackableItem;
    },
    []
  );

  /**
   * Mark an item as deleted
   */
  const markAsDeleted = useCallback(
    (item: TrackableEntity<T>, identifier: (item: T) => boolean) => {
      // Remove from items
      setItems((prev) => prev.filter((current) => !identifier(current as T)));

      // Only track for deletion if it wasn't newly inserted
      if (item.changeState !== ChangeState.INSERTED) {
        const deleteItem = {
          ...item,
          changeState: ChangeState.DELETED,
          hasUnsavedChanges: true,
        } as TrackableEntity<T>;

        setDeletedItems((prev) => [...prev, deleteItem]);
      }
    },
    []
  );

  /**
   * Reset tracking state after successful save
   */
  const resetTracking = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        changeState: ChangeState.UNCHANGED,
        hasUnsavedChanges: false,
      }))
    );
    setDeletedItems([]);
  }, []);

  /**
   * Get all items that have changes
   */
  const getChangedItems = useCallback(() => {
    return [...items.filter((item) => item.hasUnsavedChanges), ...deletedItems];
  }, [items, deletedItems]);

  /**
   * Get payload for API with proper change tracking
   */
  const getChangePayload = useCallback(
    (transform: (item: T) => any = (item) => item) => {
      return [
        // Items with changes
        ...items
          .filter((item) => item.hasUnsavedChanges)
          .map((item) => ({
            ...transform(item as T),
            changeState: item.changeState,
          })),
        // Deleted items
        ...deletedItems.map((item) => ({
          // For deleted items, only send identifying information
          ...transform(item as T),
          changeState: ChangeState.DELETED,
        })),
      ];
    },
    [items, deletedItems]
  );

  return {
    items,
    deletedItems,
    setAllItems,
    markAsInserted,
    markAsUpdated,
    markAsDeleted,
    resetTracking,
    getChangedItems,
    getChangePayload,
  };
}

export default useStateTracking;
