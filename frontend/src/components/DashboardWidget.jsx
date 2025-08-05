import React, { useState } from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Progress from './Progress.jsx';
import ChartComponent from './ChartComponent.jsx';

export default function DashboardWidget({ 
  title, 
  type, 
  data, 
  config = {}, 
  onEdit,
  onDelete,
  isEditable = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderWidgetContent = () => {
    switch (type) {
      case 'summary':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.value}</div>
            <div className="text-sm text-gray-600">{data.label}</div>
            {data.change && (
              <div className={`text-xs mt-1 ${data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.change > 0 ? '+' : ''}{data.change}% dari bulan lalu
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{data.label}</span>
              <span className="text-sm text-gray-600">{data.value}%</span>
            </div>
            <Progress 
              value={data.value} 
              max={100}
              variant={data.value >= 100 ? 'success' : data.value >= 70 ? 'warning' : 'primary'}
            />
            {data.target && (
              <div className="text-xs text-gray-600 mt-1">
                Target: {data.target}
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="h-48">
            <ChartComponent 
              type={config.chartType || 'line'}
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: config.showLegend !== false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        );

      case 'metric':
        return (
          <div className="grid grid-cols-2 gap-4">
            {data.metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-500">Widget type tidak dikenal</div>;
    }
  };

  return (
    <Card className={`relative ${isExpanded ? 'col-span-2 row-span-2' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {isEditable && (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '⤓' : '⤢'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onEdit && onEdit()}
              >
                ✏️
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onDelete && onDelete()}
              >
                🗑️
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={isExpanded ? 'h-full' : ''}>
        {renderWidgetContent()}
      </div>

      {/* Expanded view for charts */}
      {isExpanded && type === 'chart' && (
        <div className="mt-4 h-64">
          <ChartComponent 
            type={config.chartType || 'line'}
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      )}
    </Card>
  );
} 