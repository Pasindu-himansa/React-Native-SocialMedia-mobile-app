const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export const uploadImage = async (imageUri: string): Promise<string> => {
  const formData = new FormData();

  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(`Upload failed: ${JSON.stringify(data)}`);
  }

  return data.secure_url;
};
```

Now remove `firebase.ts` from `.gitignore` since it has no secrets — only `env` stays gitignored:
```
.env