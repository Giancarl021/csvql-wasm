export default function () {
    function fireUpload() {

    }

    function onSqliteUploaded(callback: (data: Uint8Array) => void) {
        
    }

    function onCsvUploaded(callback: (data: string, filename: string) => Promise<void>) {

    }

    return {
        onSqliteUploaded,
        onCsvUploaded
    };
}