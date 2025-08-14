
import { useAuthStore } from '@/src/auth/stores/auth.store';
import { Redirect } from 'expo-router';


const Index = () => {
  const { isLoggedIn ,hasCompletedOnboarding} = useAuthStore();

  if (isLoggedIn ) {
    return <Redirect href= "/(tabs)/conversation" />;
  }
  else {
    if (hasCompletedOnboarding) {
      return <Redirect href= "/auth" />;
    }
    else {
      return <Redirect href= "/onboarding" />;
    }
  }
}

export default Index;
