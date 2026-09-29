import fs from "fs";
import path from "path";

const apiDir = "/Volumes/Lexar/Avenlixx Technologies/unitrack/src/app/api";

function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.name === "route.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

function addPermissionCheck(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");
  
  // Skip if already has permission check
  if (content.includes("checkRoutePermission") || content.includes("checkPermission")) {
    console.log(`SKIP: ${filePath} - already has permission check`);
    return;
  }
  
  // Skip certain routes that shouldn't have auth (login, logout, verify-otp, etc.)
  const skipRoutes = [
    "/auth/login",
    "/auth/logout",
    "/auth/verify-otp",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-otp",
    "/auth/tour-completed",
    "/guided-tour",
    "/checkout/esewa/success",
    "/checkout/esewa/failure",
    "/checkout/connectips/success",
    "/checkout/connectips/failure",
    "/notifications/stream", // SSE endpoint
  ];
  
  if (skipRoutes.some(r => filePath.includes(r))) {
    console.log(`SKIP: ${filePath} - in skip list`);
    return;
  }

  // Check if it imports from @/lib/api-utils
  const hasApiUtilsImport = content.includes("from \"@/lib/api-utils\"") || content.includes("from '@/lib/api-utils'");
  
  // Check if it has getSession
  const hasGetSession = content.includes("getSession()");
  
  if (!hasGetSession) {
    console.log(`SKIP: ${filePath} - no getSession found`);
    return;
  }

  // Add import for checkRoutePermission
  let newContent = content;
  
  // Add import
  if (!newContent.includes("checkRoutePermission")) {
    if (newContent.includes("from \"@/lib/api-utils\"")) {
      newContent = newContent.replace(
        /from ["']@\/lib\/api-utils["']/,
        `from "@/lib/api-utils"`
      ).replace(
        /import\s+{([^}]+)}\s+from\s+["']@\/lib\/api-utils["']/,
        (match) => match.replace("}", ", checkRoutePermission }")
      );
    } else if (newContent.includes("from '@/lib/api-utils'")) {
      newContent = newContent.replace(
        /import\s+{([^}]+)}\s+from\s+["']@\/lib\/api-utils["']/,
        (match) => match.replace("}", ", checkRoutePermission }")
      );
    }
  }

  // Replace session check pattern
  // Pattern: const session = await getSession();\n    if (!session) return apiError("Unauthorized", 401);
  const sessionCheckRegex = /const session = await getSession\(\);\s*\n\s*if \(!session\) return apiError\("Unauthorized", 401\);/g;
  
  newContent = newContent.replace(sessionCheckRegex, (match) => {
    return `const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;`;
  });

  // Also handle variations
  const sessionCheckRegex2 = /const session = await getSession\(\);\s*\n\s*if \(!session\) return apiError\("Unauthorized"\)/g;
  newContent = newContent.replace(sessionCheckRegex2, (match) => {
    return `const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;`;
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`UPDATED: ${filePath}`);
  } else {
    console.log(`NO CHANGE: ${filePath}`);
  }
}

const files = walkDir(apiDir);
console.log(`Found ${files.length} route.ts files`);

files.forEach(f => addPermissionCheck(f));

console.log("Done!");