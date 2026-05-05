import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GroupsStackParamList } from "../types";
import { useSplitPayTheme } from "../theme/ThemeProvider";
import { CreateGroupScreen } from "../screens/groups/CreateGroupScreen";
import { GroupDetailScreen } from "../screens/groups/GroupDetailScreen";
import { GroupsScreen } from "../screens/groups/GroupsScreen";

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export function GroupsStack() {
  const { colors } = useSplitPayTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
}
