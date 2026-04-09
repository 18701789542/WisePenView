import React from 'react';
import { Collapse, Typography } from 'antd';
import { LuChevronRight, LuWrench } from 'react-icons/lu';
import styles from './ToolCallBlock.module.less';

const { Paragraph } = Typography;

interface ToolCallBlockProps {
  content: string;
  loading?: boolean;
}

const ToolCallBlock: React.FC<ToolCallBlockProps> = ({ content, loading }) => {
  if (!content && !loading) return null;

  return (
    <div className={styles.toolWrapper}>
      <Collapse
        ghost
        size="small"
        defaultActiveKey={loading ? ['1'] : []}
        classNames={{
          header: styles.collapseHeader,
          body: styles.collapseBody,
        }}
        expandIcon={({ isActive }) => (
          <LuChevronRight
            className={`${styles.expandIcon} ${isActive ? styles.expandIconActive : ''}`}
          />
        )}
        items={[
          {
            key: '1',
            label: (
              <div className={styles.headerLabel}>
                <LuWrench />
                <span>{loading ? '工具调用中...' : '工具调用过程'}</span>
              </div>
            ),
            children: (
              <Paragraph className={styles.paragraph}>
                <pre className={styles.content}>{content}</pre>
              </Paragraph>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ToolCallBlock;
