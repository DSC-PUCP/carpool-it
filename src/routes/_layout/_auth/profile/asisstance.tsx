import { createFileRoute } from '@tanstack/react-router';
import styles from '@/assets/styles/no-scrollbar.module.css';
import SupportSection from '@/modules/profile/components/SupportSection';

export const Route = createFileRoute('/_layout/_auth/profile/asisstance')({
  component: AssistancePage,
});

function AssistancePage() {
  return (
    <div className="flex-1 flex w-full flex-col overflow-hidden [view-transition-name:main-content]">
      <main
        className={`flex-1 overflow-y-scroll ${styles['no-scrollbar']} py-4`}
      >
        <SupportSection />
      </main>
    </div>
  );
}
