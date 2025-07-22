"use client"

import * as React from "react"
import * as Recharts from "recharts"
import { cn } from "@/lib/utils"

type ThemeKey = "light" | "dark"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ThemeKey, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement | React.ReactElement[]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-hidden",
          "[&_.recharts-sector]:outline-hidden",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <Recharts.ResponsiveContainer>
          {React.Children.only(children)}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.theme || cfg.color
  )

  if (!colorConfig.length) return null

  const styleContent = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const vars = colorConfig
        .map(([key, cfg]) => {
          const color = cfg.theme?.[theme as ThemeKey] || cfg.color
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
        .join("\n")
      return `${prefix} [data-chart=${id}] {\n${vars}\n}`
    })
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: styleContent }} />
}

const ChartTooltip = Recharts.Tooltip

// Definindo um tipo personalizado para TooltipPayload
interface CustomTooltipPayload {
  name?: string
  value?: unknown
  dataKey?: string
  color?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean
  payload?: CustomTooltipPayload[]
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: string | number
  labelFormatter?: (label: string | number, payload: CustomTooltipPayload[]) => React.ReactNode
  labelClassName?: string
  color?: string
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  const [item] = payload
  const key = labelKey || item?.dataKey?.toString() || item?.name?.toString() || "value"
  const itemConfig = getPayloadConfigFromPayload(config, item as Record<string, unknown>, key)

  const tooltipLabel = hideLabel
    ? null
    : labelFormatter && label
    ? labelFormatter(label, payload)
    : itemConfig?.label || label

  const showLabelInEach = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border border-border/50 bg-background shadow-xl text-xs rounded-lg px-2.5 py-1.5 grid gap-1.5 min-w-[8rem]",
        className
      )}
    >
      {!showLabelInEach && tooltipLabel && (
        <div className={cn("font-medium", labelClassName)}>{tooltipLabel}</div>
      )}

      <div className="grid gap-1.5">
        {payload.map((item: CustomTooltipPayload, i: number) => {
          const key =
            nameKey || item.name?.toString() || item.dataKey?.toString() || "value"
          const itemConfig = getPayloadConfigFromPayload(config, item as Record<string, unknown>, key)
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey?.toString() ?? i}
              className={cn(
                "flex items-center gap-2 flex-wrap",
                "[&>svg]:text-muted-foreground [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {!hideIndicator && (
                <div
                  className={cn("rounded-[2px] shrink-0", {
                    "h-2.5 w-2.5": indicator === "dot",
                    "w-1 h-2": indicator === "line",
                    "w-0 border-[1.5px] border-dashed bg-transparent":
                      indicator === "dashed",
                  })}
                  style={{
                    backgroundColor:
                      indicator !== "dashed" ? (typeof indicatorColor === "string" ? indicatorColor : undefined) : undefined,
                    borderColor: typeof indicatorColor === "string" ? indicatorColor : undefined,
                  }}
                />
              )}
              <div className="flex flex-1 justify-between items-center">
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
                <span className="text-foreground font-mono font-medium">
                  {item.value?.toLocaleString?.()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = Recharts.Legend

interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  payload?: Array<{
    value: string | number
    dataKey: string | number
    color?: string
  }>
  hideIcon?: boolean
  verticalAlign?: "top" | "bottom"
  nameKey?: string
}

function ChartLegendContent({
  className,
  payload,
  hideIcon = false,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, i) => {
        const key = nameKey || item.dataKey?.toString() || "value"
        const itemConfig = getPayloadConfigFromPayload(config, item as Record<string, unknown>, key)
        return (
          <div
            key={item.value?.toString() ?? i}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
          >
            {!hideIcon ? (
              itemConfig?.icon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )
            ) : null}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: Record<string, unknown>,
  key: string
) {
  const candidate = (payload?.payload as Record<string, unknown> | undefined)?.[key] ?? payload?.[key]
  const labelKey = typeof candidate === "string" ? candidate : key
  return config[labelKey] || config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
