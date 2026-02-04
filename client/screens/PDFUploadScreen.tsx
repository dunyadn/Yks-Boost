  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Hata", "Lütfen bir PDF dosyası seçin.");
      return;
    }

    // Check if EXPO_PUBLIC_DOMAIN is set
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!domain) {
      console.error("❌ EXPO_PUBLIC_DOMAIN environment variable is not set!");
      Alert.alert(
        "Konfigürasyon Hatası",
        "API domain ayarlanmamış. Lütfen EXPO_PUBLIC_DOMAIN environment variable'ını ayarlayın."
      );
      return;
    }

    // Construct API URL with proper protocol
    const apiUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    const uploadUrl = `${apiUrl}/api/upload-pdf`;
    
    console.log("🌐 API Domain:", domain);
    console.log("📡 Upload URL:", uploadUrl);

    setUploading(true);
    setUploadProgress(0);
    setProcessingState("");

    // Progress simulation interval
    let progressInterval: NodeJS.Timeout | null = null;

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Upload timeout triggered (60s)");
      controller.abort();
    }, 60000); // 60 seconds timeout

    try {
      console.log(`📤 Starting upload: ${selectedFile.name}`);
      console.log(`📄 File URI: ${selectedFile.uri}`);

      // Start simulated progress
      setProcessingState("📄 PDF yükleniyor...");
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          return Math.min(prev + Math.random() * 10, 95);
        });
      }, 500);

      const formData = new FormData();
      
      // @ts-ignore - React Native FormData typing
      formData.append("pdf", {
        uri: selectedFile.uri,
        type: "application/pdf",
        name: selectedFile.name,
      });

      console.log("📨 Sending request to server...");

      // Update processing state after delays
      setTimeout(() => setProcessingState("🤖 AI soruları algılıyor..."), 2000);
      setTimeout(() => setProcessingState("💾 Sorular kaydediliyor..."), 4000);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      console.log(`📥 Server responded with status: ${response.status}`);
      
      // Clear progress interval and set to 100%
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setUploadProgress(100);

      // Parse response
      const responseText = await response.text();
      console.log("📥 Response body:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok || !data.success) {
        console.error("❌ Upload failed:", data.error);
        throw new Error(data.error || `Server error: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Success! ${data.questionsAdded} questions added`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başarılı! 🎉",
        `${data.questionsAdded} soru başarıyla eklendi!\n\nReels sekmesinden soruları görebilirsiniz.`,
        [
          {
            text: "Tamam",
            onPress: () => {
              setSelectedFile(null);
              setUploadProgress(0);
              setProcessingState("");
            },
          },
        ],
      );
    } catch (error) {
      console.error("❌ Upload error:", error);

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage =
        "PDF yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "İşlem zaman aşımına uğradı (60 saniye). PDF çok büyük veya sunucu yanıt vermiyor. Lütfen daha küçük bir PDF deneyin.";
        } else if (error.message.includes("Network request failed")) {
          errorMessage = "Ağ hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
        } else if (error.message.includes("EXPO_PUBLIC_DOMAIN")) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setUploading(false);

      // Final cleanup for progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };