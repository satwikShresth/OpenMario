import { defineSlotRecipe } from "@chakra-ui/react"

export const cardSlotRecipe = defineSlotRecipe({
  className: "chakra-card",
  slots: ["root", "header", "body", "footer", "title", "description"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: "0",
      wordWrap: "break-word",
      borderRadius: "l3",
      color: "fg",
      textAlign: "start",
    },
    title: {
      fontWeight: "bold",
      fontFamily: "heading",
      fontSize: "sm",
    },
    description: {
      color: "fg.muted",
      fontSize: "sm",
    },
    header: {
      paddingInline: "var(--card-padding)",
      paddingTop: "var(--card-padding)",
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
    },
    body: {
      padding: "var(--card-padding)",
      flex: "1",
      display: "flex",
      flexDirection: "column",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      gap: "2",
      paddingInline: "var(--card-padding)",
      paddingBottom: "var(--card-padding)",
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          "--card-padding": "spacing.4",
        },
        title: {
          textStyle: "md",
        },
      },
      md: {
        root: {
          "--card-padding": "spacing.6",
        },
        title: {
          textStyle: "lg",
        },
      },
      lg: {
        root: {
          "--card-padding": "spacing.7",
        },
        title: {
          textStyle: "xl",
        },
      },
    },
    variant: {
      elevated: {
        root: {
          bg: "bg.panel",
          borderWidth: "2px",
          borderColor: "border.emphasized",
          boxShadow: "lg",
          transition: "transform 120ms ease, box-shadow 120ms ease",
          _hover: {
            transform: "translate(-2px, -2px)",
            boxShadow: "xl",
          },
        },
      },
      outline: {
        root: {
          bg: "bg.panel",
          borderWidth: "2px",
          borderColor: "border",
          boxShadow: "md",
          transition: "transform 120ms ease, box-shadow 120ms ease",
          _hover: {
            transform: "translate(-1px, -1px)",
            boxShadow: "lg",
          },
        },
      },
      subtle: {
        root: {
          bg: "bg.muted",
          borderWidth: "2px",
          borderColor: "border.muted",
          boxShadow: "sm",
        },
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
})
