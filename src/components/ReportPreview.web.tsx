import { reportCss } from '@/lib/report';

/** В браузере показываем отчёт ровно таким, каким он будет в PDF */
export function ReportPreview({ body }: { body: string }) {
  return (
    <div
      style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: `<style>${reportCss}</style>${body}` }}
    />
  );
}
