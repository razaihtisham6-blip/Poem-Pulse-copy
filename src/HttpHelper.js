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

export function analyzeText(text) {
    return fetch("http://127.0.0.1:8000/analyse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
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

export async function sendShutdown() {
    try {
        const response = await fetch("http://127.0.0.1:8000/shutdown", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(`Shutdown request failed with status ${response.status}`);
            //console.error("Failed to send shutdown request:", response.statusText);
        }

        const data = await response.json();
        console.log("Shutdown response:", data);
        return data.message;
    } catch (err) {
        console.error("Error sending shutdown request:", err);
    }
}