/**
 * Composite quantum manager for handling entangled systems
 */

import { QuantumObject } from '../core/types';
import { ICompositeQuantumManager } from './types';

/**
 * Manages quantum objects that span multiple graph elements (entangled systems)
 */
export class CompositeQuantumManager implements ICompositeQuantumManager {
  private composites: Map<string, QuantumObject> = new Map();
  private elementToComposite: Map<string, string> = new Map();

  setComposite(elementIds: string[], obj: QuantumObject): void {
    const compositeId = this.generateCompositeId(elementIds);
    this.composites.set(compositeId, obj);
    
    // Map each element to this composite
    elementIds.forEach(id => {
      this.elementToComposite.set(id, compositeId);
    });
  }

  getComposite(elementIds: string[]): QuantumObject | undefined {
    const compositeId = this.generateCompositeId(elementIds);
    return this.composites.get(compositeId);
  }

  getCompositeForElement(elementId: string): QuantumObject | undefined {
    const compositeId = this.elementToComposite.get(elementId);
    return compositeId ? this.composites.get(compositeId) : undefined;
  }

  private generateCompositeId(elementIds: string[]): string {
    return [...elementIds].sort().join('_');
  }
}
