export type AiTask = {
  "version": "0.1.0",
  "name": "ai_task",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gpuNodeRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agentRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aiTaskRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "registerGpuNode",
      "accounts": [
        {
          "name": "gpuNodeRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "node",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "node",
          "type": {
            "defined": "GpuNode"
          }
        }
      ]
    },
    {
      "name": "registerAgent",
      "accounts": [
        {
          "name": "agentRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "agent",
          "type": {
            "defined": "Agent"
          }
        }
      ]
    },
    {
      "name": "submitTask",
      "accounts": [
        {
          "name": "gpuNode",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "agent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "aiTaskRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        }
      ]
    },
    {
      "name": "completeTask",
      "accounts": [
        {
          "name": "aiTaskRegistry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gpuNodeOwnerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agentOwnerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gpuNodeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "agentOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proofOfWork",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gpuNode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "cpuCores",
            "type": "u8"
          },
          {
            "name": "memory",
            "type": "u32"
          },
          {
            "name": "storage",
            "type": "u32"
          },
          {
            "name": "gpuCardModel",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "endpoint",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gpuNodeList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    },
    {
      "name": "agent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "desc",
            "type": "string"
          },
          {
            "name": "poster",
            "type": "string"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "dockerImageLink",
            "type": "string"
          },
          {
            "name": "apiDoc",
            "type": "string"
          },
          {
            "name": "dockerDefaultPort",
            "type": "u16"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "agentList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agents",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    },
    {
      "name": "aiTask",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "payer",
            "type": "publicKey"
          },
          {
            "name": "agentId",
            "type": "string"
          },
          {
            "name": "gpuNodeId",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "gpuNodeFee",
            "type": "u64"
          },
          {
            "name": "agentFee",
            "type": "u64"
          },
          {
            "name": "proofOfWork",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "aiTaskList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tasks",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "KeyIdPair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TaskAlreadyCompleted",
      "msg": "The task is already completed."
    },
    {
      "code": 6001,
      "name": "TaskNotFound",
      "msg": "Task not found."
    },
    {
      "code": 6002,
      "name": "PayerNotApproved",
      "msg": "Payer hasn't approve tokens."
    },
    {
      "code": 6003,
      "name": "PayerBalanceNotEnough",
      "msg": "Payer balance is not enough."
    },
    {
      "code": 6004,
      "name": "PayerNotOwner",
      "msg": "Payer is not the owner of the task."
    },
    {
      "code": 6005,
      "name": "AgentNotFound",
      "msg": "The agent is not found."
    },
    {
      "code": 6006,
      "name": "GpuNodeNotFound",
      "msg": "The GPU node is not found."
    }
  ]
};

export const IDL: AiTask = {
  "version": "0.1.0",
  "name": "ai_task",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gpuNodeRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agentRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aiTaskRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "registerGpuNode",
      "accounts": [
        {
          "name": "gpuNodeRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "node",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "node",
          "type": {
            "defined": "GpuNode"
          }
        }
      ]
    },
    {
      "name": "registerAgent",
      "accounts": [
        {
          "name": "agentRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "agent",
          "type": {
            "defined": "Agent"
          }
        }
      ]
    },
    {
      "name": "submitTask",
      "accounts": [
        {
          "name": "gpuNode",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "agent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "aiTaskRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        }
      ]
    },
    {
      "name": "completeTask",
      "accounts": [
        {
          "name": "aiTaskRegistry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gpuNodeOwnerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agentOwnerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gpuNodeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "agentOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proofOfWork",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gpuNode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "cpuCores",
            "type": "u8"
          },
          {
            "name": "memory",
            "type": "u32"
          },
          {
            "name": "storage",
            "type": "u32"
          },
          {
            "name": "gpuCardModel",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "endpoint",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "gpuNodeList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    },
    {
      "name": "agent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "desc",
            "type": "string"
          },
          {
            "name": "poster",
            "type": "string"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "dockerImageLink",
            "type": "string"
          },
          {
            "name": "apiDoc",
            "type": "string"
          },
          {
            "name": "dockerDefaultPort",
            "type": "u16"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "agentList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agents",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    },
    {
      "name": "aiTask",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "payer",
            "type": "publicKey"
          },
          {
            "name": "agentId",
            "type": "string"
          },
          {
            "name": "gpuNodeId",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "gpuNodeFee",
            "type": "u64"
          },
          {
            "name": "agentFee",
            "type": "u64"
          },
          {
            "name": "proofOfWork",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "aiTaskList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tasks",
            "type": {
              "vec": {
                "defined": "KeyIdPair"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "KeyIdPair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TaskAlreadyCompleted",
      "msg": "The task is already completed."
    },
    {
      "code": 6001,
      "name": "TaskNotFound",
      "msg": "Task not found."
    },
    {
      "code": 6002,
      "name": "PayerNotApproved",
      "msg": "Payer hasn't approve tokens."
    },
    {
      "code": 6003,
      "name": "PayerBalanceNotEnough",
      "msg": "Payer balance is not enough."
    },
    {
      "code": 6004,
      "name": "PayerNotOwner",
      "msg": "Payer is not the owner of the task."
    },
    {
      "code": 6005,
      "name": "AgentNotFound",
      "msg": "The agent is not found."
    },
    {
      "code": 6006,
      "name": "GpuNodeNotFound",
      "msg": "The GPU node is not found."
    }
  ]
};
