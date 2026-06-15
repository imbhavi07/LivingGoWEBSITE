    const payload: OwnerPropertyPayload = {
      ...parsed.data,
      imageFiles: [], // Keep for compatibility but we'll handle files differently
      lat: pickedLocation.lat,
      lng: pickedLocation.lng
    };

    // Prepare room-type mappings for backend
    // Format: [{"index":0,"roomType":"Bedroom 1"},{"index":1,"roomType":"Bedroom 2"},...]
    const roomTypeMappings = uploadSlots
      .map((slot, index) => ({
        index,
        roomType: `${slot.type.charAt(0).toUpperCase() + slot.type.slice(1)} ${slot.label.split(' ')[1]}`
      }));

    // Collect all files from upload slots for submission
    const allFiles: File[] = uploadSlots.flatMap(slot => slot.files);

    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      // Create a new FormData and append all fields
      const formData = new FormData();

      // Add all standard fields from payload
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof OwnerPropertyPayload];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add room-type mappings as JSON string
      formData.append("roomTypeMappings", JSON.stringify(roomTypeMappings));

      // Add all files
      allFiles.forEach((file, index) => {
        formData.append("images", file);
      });

      if (property) {
        await updateOwnerProperty(property.id, payload, token);
        showToast("Property updated and sent for review.", "success");
      } else {
        await createOwnerProperty(payload, token);
        showToast("Property submitted for admin moderation.", "success");
      }
      router.push("/owner/properties");
    } catch {
      setError("Could not save property. Please try again.");
      showToast("Could not save property.", "error");
    } finally {
      setIsSubmitting(false);
    }