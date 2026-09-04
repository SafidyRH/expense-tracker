const OPENAPI_HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
] as const;

type OpenApiHttpMethod =
  (typeof OPENAPI_HTTP_METHODS)[number];

export type SecurityClassification =
  | "public"
  | "protected"
  | "unspecified";

export interface SecurityInventoryItem {
  method: Uppercase<OpenApiHttpMethod>;
  path: string;
  auth: SecurityClassification;
  responses: string[];
  requestContentTypes: string[];
  ownership: string | null;
}

interface OpenApiOperation {
  security?: unknown;
  responses?: Record<string, unknown>;
  requestBody?: {
    content?: Record<string, unknown>;
  };
  "x-public"?: unknown;
  "x-ownership"?: unknown;
}

interface OpenApiDocument {
  paths?: Record<
    string,
    Partial<Record<OpenApiHttpMethod, OpenApiOperation>>
  >;
}

export function createSecurityInventory(
  document: OpenApiDocument
): SecurityInventoryItem[] {
  return Object.entries(
    document.paths ?? {}
  ).flatMap(
    ([path, operations]) =>
      OPENAPI_HTTP_METHODS.flatMap(
        (method) => {
          const operation =
            operations[method];

          if (!operation) {
            return [];
          }

          return [
            {
              method:
                method.toUpperCase() as Uppercase<OpenApiHttpMethod>,

              path,

              auth:
                classifyAuth(
                  operation
                ),

              responses:
                Object.keys(
                  operation.responses ?? {}
                ).sort(),

              requestContentTypes:
                Object.keys(
                  operation.requestBody
                    ?.content ?? {}
                ).sort(),

              ownership:
                typeof operation[
                  "x-ownership"
                ] === "string"
                  ? operation[
                      "x-ownership"
                    ]
                  : null,
            },
          ];
        }
      )
  );
}

export function findSecurityInventoryViolations(
  inventory: SecurityInventoryItem[]
) {
  return inventory.flatMap((item) => {
    const violations: string[] = [];

    if (item.auth === "unspecified") {
      violations.push(
        `${item.method} ${item.path} must declare security or x-public`
      );
    }

    if (
      item.auth === "protected" &&
      !item.responses.includes("401")
    ) {
      violations.push(
        `${item.method} ${item.path} is protected but does not document 401`
      );
    }

    if (
      item.path.startsWith("/api/") &&
      item.auth === "public" &&
      !item.path.startsWith("/api/auth/")
    ) {
      violations.push(
        `${item.method} ${item.path} is a public /api route outside /api/auth`
      );
    }

    if (
      item.requestContentTypes.length > 0 &&
      !item.requestContentTypes.includes(
        "application/json"
      )
    ) {
      violations.push(
        `${item.method} ${item.path} has a request body without application/json`
      );
    }

    return violations;
  });
}

function classifyAuth(
  operation: OpenApiOperation
): SecurityClassification {
  if (operation["x-public"] === true) {
    return "public";
  }

  if (hasSecurityRequirement(operation)) {
    return "protected";
  }

  return "unspecified";
}

function hasSecurityRequirement(
  operation: OpenApiOperation
) {
  return (
    Array.isArray(operation.security) &&
    operation.security.some((requirement) =>
      isNonEmptyObject(requirement)
    )
  );
}

function isNonEmptyObject(
  value: unknown
) {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length > 0
  );
}
