const loadVisits = async () => {
    if (!token) {
      // Redirect to login if no token
      if (typeof window !== "undefined") {
        window.location.href = "/visiting/login";
      }
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        "/visiting/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVisits(response.data.visits);
    } catch (error: any) {
      console.error("Failed to load visits:", error);
      // Clear invalid token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("intern_token");
        window.location.href = "/visiting/login";
      }
    } finally {
      setLoading(false);
    }
  };