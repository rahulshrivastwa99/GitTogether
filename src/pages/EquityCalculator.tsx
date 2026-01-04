import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Slider } from "@/components/ui/slider";

const COLORS = ["hsl(263, 70%, 58%)", "hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)"];

interface ContributionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  emoji: string;
}

const ContributionSlider = ({ label, value, onChange, color, emoji }: ContributionSliderProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <span className="text-lg font-bold" style={{ color }}>
        {value}%
      </span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      max={100}
      step={1}
      className="w-full"
    />
  </div>
);

const EquityCalculator = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [design, setDesign] = useState(33);
  const [coding, setCoding] = useState(34);
  const [pitch, setPitch] = useState(33);

  // Normalize values to always sum to 100
  const total = design + coding + pitch;
  const normalizedData = [
    { name: "Design Work", value: Math.round((design / total) * 100), color: COLORS[0] },
    { name: "Coding Commits", value: Math.round((coding / total) * 100), color: COLORS[1] },
    { name: "Pitch Prep", value: Math.round((pitch / total) * 100), color: COLORS[2] },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 glass border-b flex items-center px-6"
        >
          <h1 className="text-xl font-bold text-foreground">Equity Calculator</h1>
        </motion.header>

        <div className="container max-w-5xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Project Ownership Split
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Adjust the sliders to calculate fair equity distribution based on each team member's contributions.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-8 border"
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={normalizedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={500}
                  >
                    {normalizedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass rounded-lg px-4 py-2 border">
                            <p className="text-sm font-medium text-foreground">
                              {payload[0].name}: {payload[0].value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 mt-4">
                {normalizedData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sliders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-8 border space-y-8"
            >
              <h3 className="text-lg font-bold text-foreground mb-6">
                Contribution Weights
              </h3>

              <ContributionSlider
                label="Design Work"
                emoji="🎨"
                value={design}
                onChange={setDesign}
                color={COLORS[0]}
              />

              <ContributionSlider
                label="Coding Commits"
                emoji="💻"
                value={coding}
                onChange={setCoding}
                color={COLORS[1]}
              />

              <ContributionSlider
                label="Pitch Prep"
                emoji="🎤"
                value={pitch}
                onChange={setPitch}
                color={COLORS[2]}
              />

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span className="font-bold text-foreground">{total}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Percentages are normalized to sum to 100%
                </p>
              </div>
            </motion.div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 glass rounded-2xl p-6 border"
          >
            <h3 className="font-bold text-foreground mb-4">💡 Pro Tips for Fair Equity</h3>
            <ul className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Discuss equity expectations before the hackathon starts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Consider both time invested and value created
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Document contributions to avoid disputes later
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EquityCalculator;
