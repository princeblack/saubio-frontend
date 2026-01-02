import type { AdminNotificationLogItem } from '@saubio/models';

export type NotificationTimelineGranularity = 'hour' | 'day';

export interface NotificationStats {
  total: number;
  delivered: number;
  sent: number;
  pending: number;
  failed: number;
  bounced: number;
  byChannel: Array<{ channel: string; value: number }>;
  timeline: Array<{ label: string; delivered: number; failed: number }>;
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  day: 'numeric',
});

const hourFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const pad = (value: number) => value.toString().padStart(2, '0');

const buildBucketKey = (date: Date, granularity: NotificationTimelineGranularity) => {
  const base = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  if (granularity === 'hour') {
    return `${base}T${pad(date.getUTCHours())}`;
  }
  return base;
};

const formatLabel = (date: Date, granularity: NotificationTimelineGranularity) =>
  granularity === 'hour' ? hourFormatter.format(date) : dayFormatter.format(date);

export const aggregateNotificationStats = (
  logs: AdminNotificationLogItem[],
  granularity: NotificationTimelineGranularity = 'day'
): NotificationStats => {
  const byStatus: Record<AdminNotificationLogItem['deliveryStatus'], number> = {
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    bounced: 0,
  };
  const byChannel = new Map<string, number>();
  const timelineMap = new Map<
    string,
    {
      key: string;
      label: string;
      delivered: number;
      failed: number;
    }
  >();

  logs.forEach((log) => {
    const status = log.deliveryStatus;
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    const channelValue = byChannel.get(log.channel) ?? 0;
    byChannel.set(log.channel, channelValue + 1);

    const createdAt = new Date(log.createdAt);
    const bucketKey = buildBucketKey(createdAt, granularity);
    const bucket = timelineMap.get(bucketKey) ?? {
      key: bucketKey,
      label: formatLabel(createdAt, granularity),
      delivered: 0,
      failed: 0,
    };

    if (status === 'failed' || status === 'bounced') {
      bucket.failed += 1;
    } else if (status === 'delivered') {
      bucket.delivered += 1;
    } else if (status === 'sent') {
      bucket.delivered += 1;
    }

    timelineMap.set(bucketKey, bucket);
  });

  const total = logs.length;
  const channels = Array.from(byChannel.entries())
    .map(([channel, value]) => ({ channel, value }))
    .sort((a, b) => b.value - a.value);

  const timeline = Array.from(timelineMap.values()).sort((a, b) => a.key.localeCompare(b.key));

  return {
    total,
    delivered: byStatus.delivered,
    sent: byStatus.sent,
    pending: byStatus.pending,
    failed: byStatus.failed,
    bounced: byStatus.bounced,
    byChannel: channels,
    timeline,
  };
};
