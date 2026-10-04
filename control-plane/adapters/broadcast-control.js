/**
 * Dog Tag Day Broadcast Control Adapter
 *
 * The commercial queue is a control-plane concern. Platform publishers are
 * execution engines underneath it. This keeps scheduling/rotation owned by
 * Dog Tag Day while allowing the existing broadcaster to remain the fallback.
 */

export class BroadcastQueue {
  constructor({ items = [], cadenceHours = 3, startIndex = 0 } = {}) {
    this.items = items;
    this.cadenceHours = cadenceHours;
    this.index = startIndex;
  }

  next() {
    if (!this.items.length) {
      return { ok: false, error: "broadcast_queue_empty" };
    }

    const item = this.items[this.index % this.items.length];
    this.index = (this.index + 1) % this.items.length;

    return {
      ok: true,
      item,
      nextIndex: this.index,
      cadenceHours: this.cadenceHours
    };
  }

  peek() {
    if (!this.items.length) return { ok: false, error: "broadcast_queue_empty" };
    return {
      ok: true,
      item: this.items[this.index % this.items.length],
      nextIndex: this.index,
      cadenceHours: this.cadenceHours
    };
  }
}

export async function executeBroadcast(queue, publish, platforms) {
  const selected = queue.next();
  if (!selected.ok) return selected;

  const results = await Promise.all(
    platforms.map(async platform => {
      try {
        return await publish({
          ...selected.item,
          platform
        });
      } catch (error) {
        return {
          ok: false,
          platform,
          error: error?.message || "platform_publish_failed"
        };
      }
    })
  );

  return {
    ok: results.some(result => result.ok),
    item: selected.item,
    cadenceHours: selected.cadenceHours,
    results
  };
}

export const broadcastContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  mode: "unified-shell",
  defaultCadenceHours: 3,
  rotation: "sequential",
  policy: {
    queueOwnedByDogTagDay: true,
    platformFailureIsolation: true,
    noCredentialStorageInQueue: true,
    legacyPublisherMayRemainFallback: true
  }
};
