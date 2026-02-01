/**
 * GRACE-X Valuation Dashboard - Chart.js Implementation
 * Interactive charts and live data integration
 */

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

// Chart.js default configurations
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(100, 116, 139, 0.2)';
Chart.defaults.font.family = "'Segoe UI', sans-serif";

// ============================================================================
// MODULE VALUATION CHART (Horizontal Bar)
// ============================================================================

const moduleValuationCtx = document.getElementById('moduleValuationChart').getContext('2d');
const moduleValuationChart = new Chart(moduleValuationCtx, {
  type: 'bar',
  data: {
    labels: ['Builder™', 'OSINT™', 'SiteOps™', 'Sport™', 'Accounting™'],
    datasets: [
      {
        label: 'Min Valuation (£K)',
        data: [180, 180, 144, 108, 108],
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2
      },
      {
        label: 'Max Valuation (£K)',
        data: [1400, 1400, 1000, 720, 720],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 13,
            weight: 600
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#06b6d4',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': £' + context.parsed.x.toLocaleString() + 'K';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return '£' + value + 'K';
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 13,
            weight: 600
          }
        }
      }
    }
  }
});

// ============================================================================
// REVENUE GROWTH SCENARIOS (Line Chart)
// ============================================================================

const revenueGrowthCtx = document.getElementById('revenueGrowthChart').getContext('2d');
const revenueGrowthChart = new Chart(revenueGrowthCtx, {
  type: 'line',
  data: {
    labels: ['Now', '6 Months', '12 Months', '18 Months', '24 Months'],
    datasets: [
      {
        label: 'Conservative (70% prob)',
        data: [0, 400, 2500, 8000, 15000],
        borderColor: 'rgba(6, 182, 212, 1)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Moderate (20% prob)',
        data: [0, 2500, 10000, 25000, 40000],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Optimistic (10% prob)',
        data: [0, 10000, 40000, 100000, 200000],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 13,
            weight: 600
          },
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#06b6d4',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': £' + context.parsed.y.toLocaleString() + ' MRR';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return '£' + (value / 1000).toFixed(0) + 'K';
          }
        }
      }
    }
  }
});

// ============================================================================
// VALUATION MULTIPLES CHART (Bar Chart)
// ============================================================================

const valuationMultiplesCtx = document.getElementById('valuationMultiplesChart').getContext('2d');
const valuationMultiplesChart = new Chart(valuationMultiplesCtx, {
  type: 'bar',
  data: {
    labels: ['Pre-Revenue', '£24K ARR', '£120K ARR', '£240K ARR', '£600K+ ARR'],
    datasets: [
      {
        label: 'Min Valuation',
        data: [5, 72, 600, 1440, 4800],
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2
      },
      {
        label: 'Max Valuation',
        data: [15, 144, 960, 2400, 7200],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 13,
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#06b6d4',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': £' + context.parsed.y.toLocaleString() + 'K';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return '£' + (value / 1000).toFixed(0) + 'M';
          }
        }
      }
    }
  }
});

// ============================================================================
// FETCH LIVE SYSTEM METRICS
// ============================================================================

async function fetchLiveMetrics() {
  try {
    const response = await fetch('http://localhost:3000/api/system/status');
    
    if (!response.ok) {
      throw new Error('Backend offline');
    }
    
    const data = await response.json();
    
    // Update live metrics
    document.getElementById('backend-status').textContent = '✅ Online';
    document.getElementById('backend-status').style.color = '#10b981';
    
    // Format uptime
    const hours = Math.floor(data.uptime / 3600);
    const minutes = Math.floor((data.uptime % 3600) / 60);
    document.getElementById('system-uptime').textContent = `${hours}h ${minutes}m`;
    
    document.getElementById('modules-active').textContent = `${data.modules.wired}/${data.modules.total}`;
    
  } catch (error) {
    console.error('Failed to fetch live metrics:', error);
    document.getElementById('backend-status').textContent = '❌ Offline';
    document.getElementById('backend-status').style.color = '#ef4444';
    document.getElementById('system-uptime').textContent = 'N/A';
    document.getElementById('modules-active').textContent = 'N/A';
  }
}

// Fetch metrics on load
fetchLiveMetrics();

// Auto-refresh every 10 seconds
setInterval(fetchLiveMetrics, 10000);

// ============================================================================
// RESIZE CHARTS ON WINDOW RESIZE
// ============================================================================

window.addEventListener('resize', () => {
  moduleValuationChart.resize();
  revenueGrowthChart.resize();
  valuationMultiplesChart.resize();
});

// ============================================================================
// PRINT FUNCTIONALITY
// ============================================================================

// Add print button dynamically (optional)
const printBtn = document.createElement('button');
printBtn.textContent = '🖨️ Print / Save PDF';
printBtn.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
  transition: all 0.2s;
  z-index: 1000;
`;

printBtn.addEventListener('mouseover', () => {
  printBtn.style.transform = 'translateY(-3px)';
  printBtn.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.6)';
});

printBtn.addEventListener('mouseout', () => {
  printBtn.style.transform = 'translateY(0)';
  printBtn.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.4)';
});

printBtn.addEventListener('click', () => {
  window.print();
});

document.body.appendChild(printBtn);

console.log('📊 GRACE-X Valuation Dashboard loaded successfully');
console.log(`📈 Charts initialized: Module Valuation, Revenue Growth, Valuation Multiples`);
console.log(`🔄 Live metrics updating every 10 seconds`);
