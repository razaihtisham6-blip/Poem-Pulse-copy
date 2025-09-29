export function analyzeFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return fetch("http://127.0.0.1:8000/analyse", {
        method: "POST",
        body: formData,
    }).then(async (res) => {
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || "Backend processing error");
            } catch (parseError) {
                throw new Error(`Server error (${res.status})`);
            }
        }
        return res.json();
    });
}