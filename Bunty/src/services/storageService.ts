export const uploadImage = async (imageUri: string): Promise<string> => {
  const filename = imageUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: filename,
    type,
  } as any);
  formData.append("upload_preset", "bunty_uploads");
  formData.append("cloud_name", "daeswtiof");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/daeswtiof/image/upload",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(`Upload failed: ${JSON.stringify(data)}`);
  }

  return data.secure_url;
};
