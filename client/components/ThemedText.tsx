import { Text, type TextProps } from "react-native";

import { Colors, Typography } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption" | "link";
};

export function ThemedText({ style, type = "body", ...rest }: ThemedTextProps) {
  const getColor = () => {
    if (type === "link") {
      return Colors.dark.link;
    }
    return Colors.dark.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "body":
        return Typography.body;
      case "small":
        return Typography.small;
      case "caption":
        return Typography.caption;
      case "link":
        return Typography.link;
      default:
        return Typography.body;
    }
  };

  return (
    <Text style={[{ color: getColor() }, getTypeStyle(), style]} {...rest} />
  );
}
