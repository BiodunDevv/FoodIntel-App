type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  resource_type: string
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload is not configured for this environment.")
  }

  return { cloudName, uploadPreset }
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getCloudinaryConfig()
  const formData = new FormData()

  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    let message = "Cloudinary upload failed."
    try {
      const payload = await response.json()
      message = payload?.error?.message || message
    } catch {
      // ignore parse failure and keep fallback message
    }
    throw new Error(message)
  }

  const payload = (await response.json()) as Partial<CloudinaryUploadResult>
  if (!payload.secure_url) {
    throw new Error("Cloudinary upload did not return a secure URL.")
  }

  return {
    secure_url: payload.secure_url,
    public_id: payload.public_id || "",
    resource_type: payload.resource_type || "image",
  }
}
