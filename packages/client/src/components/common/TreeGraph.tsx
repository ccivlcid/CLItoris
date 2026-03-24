import React, { useState } from 'react';

export interface TreeNode {
  name: string;
  type: 'file' | 'dir';
  children?: TreeNode[];
  language?: string;
}

interface TreeGraphProps {
  data: TreeNode;
  level?: number;
  isLast?: boolean;
  prefix?: string;
}

export const TreeGraph: React.FC<TreeGraphProps> = ({ 
  data, 
  level = 0, 
  isLast = true, 
  prefix = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = data.children && data.children.length > 0;

  // Render current node
  const renderNode = () => {
    let connector = '';
    if (level > 0) {
      connector = isLast ? '└─ ' : '├─ ';
    }

    const toggleExpand = () => {
      if (hasChildren) setIsExpanded(!isExpanded);
    };

    return (
      <div 
        className={`group flex items-center gap-2 py-0.5 font-mono text-[12px] transition-colors hover:bg-white/5 cursor-default`}
        onClick={toggleExpand}
      >
        <span className="text-gray-600 whitespace-pre">{prefix}{connector}</span>
        <span className={`${hasChildren ? 'text-[var(--accent-amber)]' : 'text-gray-300'} flex items-center gap-1.5`}>
          {hasChildren && (
            <span className="text-[10px] text-gray-500 w-3">
              {isExpanded ? '▾' : '▸'}
            </span>
          )}
          <span className="group-hover:text-white transition-colors">
            {data.name}
            {data.type === 'dir' && '/'}
          </span>
          {data.language && (
            <span className="text-[10px] text-gray-600 ml-2">({data.language})</span>
          )}
        </span>
      </div>
    );
  };

  const childPrefix = level === 0 ? '' : prefix + (isLast ? '   ' : '│  ');

  return (
    <div>
      {renderNode()}
      {hasChildren && isExpanded && (
        <div className="ml-0">
          {data.children!.map((child, i) => (
            <TreeGraph 
              key={child.name} 
              data={child} 
              level={level + 1} 
              isLast={i === data.children!.length - 1}
              prefix={childPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
};
